# /// script
# requires-python = ">=3.12"
# dependencies = [
# "google-cloud-texttospeech",
# "pydub"
# ]
# ///

import os
import time
from google.cloud import texttospeech
from google.api_core import exceptions as google_exceptions
from pydub import AudioSegment
from pydub.silence import detect_leading_silence
from pathlib import Path

OUTPUT_DIR = "generated_audio"  # For synthesized files
TRIMMED_OUTPUT_DIR = "trimmed_audio"  # For trimmed files


def synthesize_raw_audio(
    bangla,
    output_file: Path,
    speaking_rate=1.0,
    pitch=0.0,
    volume_gain_db=0.0,
    effects_profile_id="headphone-class-device",
    retries=3,
    initial_delay=5,
):
    """Synthesizes speech from Google TTS and saves the raw audio file."""
    client = texttospeech.TextToSpeechClient()

    input_text = texttospeech.SynthesisInput(text=bangla)

    # Note: the voice can also be specified by name.
    # Names of voices can be retrieved with client.list_voices().
    voice = texttospeech.VoiceSelectionParams(
        language_code="bn-IN",
        name="bn-IN-Chirp3-HD-Aoede",
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.LINEAR16,
        speaking_rate=speaking_rate,
        pitch=pitch,
        volume_gain_db=volume_gain_db,
        effects_profile_id=[effects_profile_id]
        if effects_profile_id
        else [],  # Must be a list
    )

    start_time = time.time()
    print(f"Synthesizing: {bangla}")
    response = client.synthesize_speech(
        request={
            "input": input_text,
            "voice": voice,
            "audio_config": audio_config,
        },
    )
    end_time = time.time()

    with open(output_file, "wb") as out:
        out.write(response.audio_content)
    print(f"Successfully synthesized in {end_time - start_time:.2f}s")


def process_single_audio_file(
    raw_filepath, trimmed_filepath, silence_thresh=-50, keep_silence_ms=100
):
    """
    Trims a single audio file to have a specific amount of leading silence
    and removes trailing silence.
    """
    print(f"Starting to process file: {raw_filepath}")
    if not os.path.exists(raw_filepath):
        print(f"      Raw audio file not found: {raw_filepath}. Skipping processing.")
        return False

    audio = AudioSegment.from_mp3(raw_filepath)
    print(
        f"      Processing file: {os.path.basename(raw_filepath)}, Original Duration: {len(audio) / 1000:.2f}s"
    )

    # 1. Detect duration of actual leading silence
    print("detect leading silence")
    actual_leading_silence_duration_ms = detect_leading_silence(
        audio, silence_threshold=silence_thresh
    )
    print(f"        Detected leading silence: {actual_leading_silence_duration_ms}ms")

    # 2. Get the part of audio after the actual leading silence
    speech_part = audio[actual_leading_silence_duration_ms:]

    # 3. Prepend the desired amount of fixed leading silence
    print("prepend")
    audio_with_fixed_leading_silence = (
        AudioSegment.silent(duration=keep_silence_ms) + speech_part
    )

    print("trailing")
    # 4. Detect and trim trailing silence from this new segment
    actual_trailing_silence_duration_ms = detect_leading_silence(
        audio_with_fixed_leading_silence.reverse(), silence_threshold=silence_thresh
    )

    # Calculate end point for cutting actual trailing silence, but keep `keep_silence_ms` at the end
    end_cut_point = (
        len(audio_with_fixed_leading_silence) - actual_trailing_silence_duration_ms
    )

    # The final audio segment will be from the start up to this end_cut_point + keep_silence_ms for the tail
    final_end_point = min(
        len(audio_with_fixed_leading_silence), end_cut_point + keep_silence_ms
    )

    # Ensure the final_end_point is not before the start of the speech part (which is at keep_silence_ms in this segment)
    if (
        final_end_point <= keep_silence_ms and len(speech_part) > 0
    ):  # Check if there was any speech to begin with
        print(
            f"        - Audio for {os.path.basename(raw_filepath)} is too short after processing. Saving with fixed leading silence only."
        )
        final_audio = audio_with_fixed_leading_silence
    elif len(speech_part) == 0:  # Entirely silence
        print(
            f"        - Audio for {os.path.basename(raw_filepath)} was entirely silence. Saving {keep_silence_ms * 2}ms of silence."
        )
        final_audio = AudioSegment.silent(
            duration=keep_silence_ms * 2
        )  # Save a short silent clip
    else:
        final_audio = audio_with_fixed_leading_silence[:final_end_point]

    print("starting export")
    final_audio.export(trimmed_filepath, format="mp3")
    print(
        f"        -> Processed {os.path.basename(raw_filepath)} saved to: {trimmed_filepath}, New Duration: {len(final_audio) / 1000:.2f}s"
    )
    return True


dentalRetroflexFilenamesUniqueASCII = [
    [["তাল", "tal"], ["টাল", "ttal"]],
    [["দান", "dan"], ["ডান", "ddan"]],
    [["পাতা", "pata"], ["পাটা", "patta"]],
    [["হাত", "hat"], ["হাট", "hatt"]],
    [["কাদা", "kada"], ["কাটা", "katta"]],
    [["থাল", "thal"], ["ঠাল", "tthal"]],
    [["ধরা", "dhora"], ["ঢোরা", "ddhora"]],
    [["তন", "ton"], ["টন", "tton"]],
    [["নল", "nol"], ["ণল", "nnol"]],
    [["ভীত", "bhit"], ["ভিট", "bhitt"]],
    [["আঁত", "ant"], ["আঁট", "antt"]],
    [["দাগ", "dag"], ["ডাগ", "ddag"]],
    [["তার", "tar"], ["টার", "ttar"]],
    [["তালি", "tali"], ["টালি", "ttali"]],
    [["আদর", "ador"], ["আডার", "addar"]],
    [["তুষ", "tush"], ["টুস", "ttush"]],
    [["ধাম", "dham"], ["ঢাম", "ddham"]],
    [["থালা", "thala"], ["ঠালা", "tthala"]],
    [["পীত", "pit"], ["পিট", "pitt"]],
    [["রতি", "roti"], ["রটি", "rotti"]],
    [["সাদ", "sad"], ["সাড", "ssad"]],
    [["মতি", "moti"], ["মটি", "motti"]],
    [["কণ", "kon"], ["কন", "nkon"]],
    [["ভিতর", "bhitor"], ["ভিটার", "bhittor"]],
    [["পাথ", "path"], ["পাঠ", "patth"]],
]

if __name__ == "__main__":
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created output directory for raw audio: {OUTPUT_DIR}")
    if not os.path.exists(TRIMMED_OUTPUT_DIR):
        os.makedirs(TRIMMED_OUTPUT_DIR)
        print(f"Created output directory for trimmed audio: {TRIMMED_OUTPUT_DIR}")

    # Define consistent audio parameters for all words
    consistent_speaking_rate = 1  # Standard slower
    consistent_pitch = 0.0  # Default pitch
    consistent_volume_gain_db = 1.0  # Slight volume boost
    consistent_effects_profile = (
        "handset-class-device"  # Probably mostly using on a phone
    )

    # --- Stage 1: Synthesize all raw audio files ---
    print("\n--- STAGE 1: Synthesizing Raw Audio Files ---")

    # Iterate directly over all words, assuming no duplicates are present
    # as per the new requirement.
    for i, pair in enumerate(dentalRetroflexFilenamesUniqueASCII):
        print(f"Synthesizing Pair {i + 1}/{len(dentalRetroflexFilenamesUniqueASCII)}")
        print(f" - {pair[0][0]}")
        print(f" - {pair[1][0]}")
        for word, transliteration in pair:
            Path(OUTPUT_DIR) / f"{transliteration}.wav"

            synthesize_raw_audio(
                word,
                Path(OUTPUT_DIR) / f"{transliteration}.wav",
                speaking_rate=consistent_speaking_rate,
                pitch=consistent_pitch,
                volume_gain_db=consistent_volume_gain_db,
                effects_profile_id=consistent_effects_profile,
            )
            process_single_audio_file(
                Path(OUTPUT_DIR) / f"{transliteration}.wav",
                Path(TRIMMED_OUTPUT_DIR) / f"{transliteration}.wav",
                silence_thresh=-50,
                keep_silence_ms=100,
            )

