# /// script
# requires-python = ">=3.12"
# dependencies = [
# "google-cloud-texttospeech",
# "scipy",
# "librosa",
# "rich"
# ]
# ///

import time
import io
import json
import random
import argparse
import os
from pathlib import Path
from google.cloud import texttospeech
from scipy.io import wavfile
import librosa
import soundfile as sf
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeRemainingColumn
from rich.table import Table
from rich.live import Live
from rich.panel import Panel
from rich import box

console = Console()


def get_minimal_voice_name(full_voice_name):
    """Extract minimal voice name from full name (e.g., 'bn-IN-Chirp3-HD-Aoede' -> 'chirp3-hd-aoede')."""
    # Remove language code prefix and convert to lowercase
    parts = full_voice_name.split('-')
    if len(parts) >= 3 and parts[0] == 'bn' and parts[1] == 'IN':
        return '-'.join(parts[2:]).lower()
    return full_voice_name.lower()


def synthesize_raw_audio(
    text,
    volume_gain_db=0.0,
    effects_profile_id="headphone-class-device",
    voice_name="bn-IN-Chirp3-HD-Aoede",
    language_code="bn-IN",
):
    """Synthesizes speech from Google TTS and returns audio data."""
    client = texttospeech.TextToSpeechClient()

    # Use text input (not SSML)
    input_text = texttospeech.SynthesisInput(text=text)

    voice = texttospeech.VoiceSelectionParams(
        language_code=language_code,
        name=voice_name,
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.LINEAR16,
        volume_gain_db=volume_gain_db,
        effects_profile_id=[effects_profile_id] if effects_profile_id else [],
    )

    response = client.synthesize_speech(
        request={
            "input": input_text,
            "voice": voice,
            "audio_config": audio_config,
        },
    )

    # Convert response to audio samples
    sample_rate, samples = wavfile.read(io.BytesIO(response.audio_content))
    return sample_rate, samples


def process_word_recording(
    word_text,
    transliteration,
    base_output_path,
    voice_config,
    base_audio_config,
    overwrite=False,
    min_file_size=1000,  # Minimum file size in bytes
    max_retries=3,
):
    """Process a single word recording and save to tree structure."""
    # Add Bengali full stop for natural speech
    text_with_stop = f"{word_text}।"

    # Create word-specific directory
    word_dir = Path(base_output_path) / transliteration
    word_dir.mkdir(exist_ok=True, parents=True)

    # Get minimal voice name for filename
    minimal_voice_name = get_minimal_voice_name(voice_config['voice_name'])
    
    # Create filename in tree structure: word/word_voicename.wav
    output_filename = f"{transliteration}_{minimal_voice_name}.wav"
    output_file = word_dir / output_filename

    # Check if file already exists and skip if not overwriting
    if output_file.exists() and not overwrite:
        file_size = output_file.stat().st_size
        if file_size > min_file_size:
            return {"status": "skipped", "file_size": file_size, "path": output_file}
        else:
            return {"status": "regenerate", "file_size": file_size, "path": output_file}

    # Retry logic for failed recordings
    for attempt in range(max_retries):
        try:
            # Generate audio
            sample_rate, samples = synthesize_raw_audio(
                text_with_stop,
                volume_gain_db=voice_config["volume_gain_db"],
                effects_profile_id=voice_config["effects_profile"],
                voice_name=voice_config["voice_name"],
            )

            # Save raw output for debugging
            sf.write("out.wav", samples, sample_rate)

            # Split audio to remove silence
            splits = librosa.effects.split(samples, top_db=40)

            if splits.shape[0] >= 1:
                # Save processed audio file
                sf.write(str(output_file), samples[splits[0][0] : splits[0][1]], sample_rate)
                
                # Validate file size
                file_size = output_file.stat().st_size
                if file_size < min_file_size:
                    if attempt < max_retries - 1:
                        # Retry with same voice
                        continue
                    else:
                        return {"status": "failed", "reason": f"File too small after {max_retries} attempts", "file_size": file_size}
                
                return {"status": "success", "file_size": file_size, "path": output_file, "voice": voice_config['voice_name']}
            else:
                if attempt < max_retries - 1:
                    voice_config = generate_random_voice_config(base_audio_config)
                    continue
                else:
                    return {"status": "failed", "reason": "No audio splits found"}
                    
        except Exception as e:
            if attempt < max_retries - 1:
                voice_config = generate_random_voice_config(base_audio_config)
                continue
            else:
                return {"status": "failed", "reason": str(e)}
    
    return {"status": "failed", "reason": f"Failed after {max_retries} attempts"}


def collect_all_unique_words(all_data):
    """Collect all unique words from all categories to avoid duplication."""
    unique_words = {}  # transliteration -> (bengali_text, transliteration)

    for lang_code, lang_data in all_data.items():
        if "types" not in lang_data:
            continue

        for category, category_data in lang_data["types"].items():
            if "pairs" not in category_data:
                continue

            for pair in category_data["pairs"]:
                for word in pair:
                    bengali_text, transliteration = word[0], word[1]
                    if transliteration not in unique_words:
                        unique_words[transliteration] = (bengali_text, transliteration)

    return unique_words


def get_all_voice_names():
    """Get all available voice names for Bengali."""
    # Chirp3-HD voices (don't support prosody parameters)
    chirp3_hd_voices = [
        "bn-IN-Chirp3-HD-Achernar",
        "bn-IN-Chirp3-HD-Achird",
        "bn-IN-Chirp3-HD-Algenib",
        "bn-IN-Chirp3-HD-Algieba",
        "bn-IN-Chirp3-HD-Alnilam",
        "bn-IN-Chirp3-HD-Aoede",
        "bn-IN-Chirp3-HD-Autonoe",
        "bn-IN-Chirp3-HD-Callirrhoe",
        "bn-IN-Chirp3-HD-Charon",
        "bn-IN-Chirp3-HD-Despina",
        "bn-IN-Chirp3-HD-Enceladus",
        "bn-IN-Chirp3-HD-Erinome",
        "bn-IN-Chirp3-HD-Fenrir",
        "bn-IN-Chirp3-HD-Gacrux",
        "bn-IN-Chirp3-HD-Iapetus",
        "bn-IN-Chirp3-HD-Kore",
        "bn-IN-Chirp3-HD-Laomedeia",
        "bn-IN-Chirp3-HD-Leda",
        "bn-IN-Chirp3-HD-Orus",
        "bn-IN-Chirp3-HD-Puck",
        "bn-IN-Chirp3-HD-Pulcherrima",
        "bn-IN-Chirp3-HD-Rasalgethi",
        "bn-IN-Chirp3-HD-Sadachbia",
        "bn-IN-Chirp3-HD-Sadaltager",
        "bn-IN-Chirp3-HD-Schedar",
        "bn-IN-Chirp3-HD-Sulafat",
        "bn-IN-Chirp3-HD-Umbriel",
    ]
    
    # Wavenet voices (support prosody parameters)
    wavenet_voices = [
        "bn-IN-Wavenet-A",
        "bn-IN-Wavenet-B",
        "bn-IN-Wavenet-C",
        "bn-IN-Wavenet-D",
    ]

    # Combine all voices
    return chirp3_hd_voices + wavenet_voices


if __name__ == "__main__":
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Generate audio files for minimal pairs")
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing audio files",
    )
    parser.add_argument(
        "--voices",
        nargs="*",
        help="Specific voices to use (default: all available voices)",
    )
    parser.add_argument(
        "--min-file-size",
        type=int,
        default=1000,
        help="Minimum file size in bytes to consider a recording valid (default: 1000)",
    )
    args = parser.parse_args()

    # Load data
    json_filepath = Path("public", "minimal_pairs_db.json")
    with open(json_filepath, "r", encoding="utf-8") as f:
        all_data = json.load(f)

    # Get base audio path for bn-IN
    lang_data = all_data["bn-IN"]
    base_output_path = Path(".") / "public" / lang_data["audioBasePath"]

    console.print(f"[bold]Output base path:[/bold] {base_output_path}")

    # Collect all unique words from all categories
    unique_words = collect_all_unique_words(all_data)
    console.print(f"[bold green]Found {len(unique_words)} unique words across all categories[/bold green]\n")

    # Base audio configuration
    base_audio_config = {
        "volume_gain_db": 0.0,
        "effects_profile": "headphone-class-device",
        "voice_name": "bn-IN-Chirp3-HD-Aoede",
    }

    # Get list of voices to use
    if args.voices:
        # Use specified voices
        voices_to_use = args.voices
    else:
        # Use all available voices
        voices_to_use = get_all_voice_names()
    
    console.print(f"[bold blue]Using {len(voices_to_use)} voice models[/bold blue]")
    
    # Statistics
    stats = {
        "total_words": len(unique_words),
        "current_word": 0,
        "successful": 0,
        "failed": 0,
        "skipped": 0,
        "regenerated": 0,
        "current_word_name": "",
        "current_voice": "",
        "start_time": time.time()
    }
    
    # Process all unique words with a single progress display
    total_recordings = len(unique_words) * len(voices_to_use)
    current_recording = 0
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TimeRemainingColumn(),
        console=console,
        refresh_per_second=4
    ) as progress:
        
        # Single overall progress bar
        overall_task = progress.add_task(
            f"[cyan]Processing audio files", 
            total=total_recordings
        )
        
        # Process all unique words
        for i, (transliteration, (bengali_text, _)) in enumerate(unique_words.items()):
            stats["current_word"] = i + 1
            stats["current_word_name"] = f"{bengali_text} ({transliteration})"
            
            word_stats = {"success": 0, "failed": 0, "skipped": 0}
            
            # Generate one recording per voice for this word
            for voice_idx, voice_name in enumerate(voices_to_use):
                current_recording += 1
                
                # Create voice configuration
                voice_config = base_audio_config.copy()
                voice_config["voice_name"] = voice_name
                
                minimal_voice = get_minimal_voice_name(voice_name)
                stats["current_voice"] = minimal_voice
                
                # Update progress description with current status
                progress.update(
                    overall_task,
                    description=f"[cyan]({current_recording}/{total_recordings}) {bengali_text} - {minimal_voice}",
                    completed=current_recording - 1
                )

                result = process_word_recording(
                    word_text=bengali_text,
                    transliteration=transliteration,
                    base_output_path=base_output_path,
                    voice_config=voice_config,
                    base_audio_config=base_audio_config,
                    overwrite=args.overwrite,
                    min_file_size=args.min_file_size,
                )

                # Update statistics based on result
                if result["status"] == "success":
                    stats["successful"] += 1
                    word_stats["success"] += 1
                elif result["status"] == "failed":
                    stats["failed"] += 1
                    word_stats["failed"] += 1
                elif result["status"] == "skipped":
                    stats["skipped"] += 1
                    word_stats["skipped"] += 1
                elif result["status"] == "regenerate":
                    stats["regenerated"] += 1
                    stats["successful"] += 1
                    word_stats["success"] += 1
                
                # Advance progress
                progress.update(overall_task, completed=current_recording)

                # Small delay to be nice to the API
                time.sleep(0.1)
            
            # Show word summary if there were failures
            if word_stats["failed"] > 0:
                console.print(
                    f"[yellow]⚠ {bengali_text}:[/yellow] "
                    f"✓ {word_stats['success']} | ✗ {word_stats['failed']} | → {word_stats['skipped']}"
                )
    
    # Final statistics
    elapsed_time = time.time() - stats["start_time"]
    
    # Create final stats table
    table = Table(title="Audio Generation Complete", box=box.ROUNDED)
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="green")
    
    table.add_row("Total Words", str(stats["total_words"]))
    table.add_row("Voices Used", str(len(voices_to_use)))
    table.add_row("Successful", str(stats["successful"]))
    table.add_row("Failed", str(stats["failed"]))
    table.add_row("Skipped", str(stats["skipped"]))
    table.add_row("Regenerated", str(stats["regenerated"]))
    table.add_row("Total Time", f"{elapsed_time:.1f}s")
    table.add_row("Output Path", str(base_output_path))
    
    console.print("\n")
    console.print(table)
    console.print(f"\n[bold green]Audio files are organized in: {base_output_path}/[word]/[word]_[voicename].wav[/bold green]")
