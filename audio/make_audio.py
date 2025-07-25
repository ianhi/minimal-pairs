# /// script
# requires-python = ">=3.12"
# dependencies = [
# "google-cloud-texttospeech",
# "scipy",
# "librosa"
# ]
# ///

import time
from google.cloud import texttospeech
from pathlib import Path
from scipy.io import wavfile
import librosa

OUTPUT_DIR = "generated_audio"  # For synthesized files
TRIMMED_OUTPUT_DIR = "trimmed_audio"  # For trimmed files


def synthesize_raw_audio(
    bangla,
    output_file: Path,
    speaking_rate=1.0,
    pitch=0.0,
    volume_gain_db=0.0,
    effects_profile_id="headphone-class-device",
):
    """Synthesizes speech from Google TTS and saves the raw audio file."""
    client = texttospeech.TextToSpeechClient()

    input_text = texttospeech.SynthesisInput(ssml=bangla)

    # Note: the voice can also be specified by name.
    # Names of voices can be retrieved with client.list_voices().
    voice = texttospeech.VoiceSelectionParams(
        language_code="bn-IN",
        name="bn-IN-Wavenet-D",
        # name="bn-IN-Chirp3-HD-Aoede",
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

    import io

    sample_rate, samples = wavfile.read(io.BytesIO(response.audio_content))

    return sample_rate, samples
    # print(response.audio_content)
    # with open(output_file, "wb") as out:
    #     out.write(response.audio_content)
    # print(f"Successfully synthesized in {end_time - start_time:.2f}s")


if __name__ == "__main__":
    import json

    json_filepath = Path("public", "audio", "minimal_pairs_db.json")
    with open(json_filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    data = data["bn-IN"]["types"]["Dental ত vs. Retroflex ট"]
    # data = data['bn-IN']['types']["Oral vs. Nasalized Vowels"]
    # data = data['bn-IN']['types']["Aspirated vs Unaspirated Voiceless"]
    OUTPUT_DIR = Path("generated_audio") / "bn-IN" / Path(data["path"]).name
    OUTPUT_DIR.mkdir(exist_ok=True, parents=True)

    # Define consistent audio parameters for all words
    consistent_speaking_rate = 1  # Standard slower
    consistent_pitch = 0.0  # Default pitch
    consistent_effects_profile = (
        "handset-class-device"  # Probably mostly using on a phone
    )

    for i, pair in enumerate(data["pairs"]):
        # pairs = [["তার", "tar"], ["টার", "ttar"]],
        # for i, pair in enumerate(pairs):
        print(f"Synthesizing Pair {i + 1}/{len(data['pairs'])}")
        print(f" - {pair[0][0]} - {pair[1][0]}")
        word = f'{pair[0][0]} <break time="500ms"/> {pair[1][0]}'
        word = f"{pair[0][0]}           {pair[1][0]}"
        word = f"""
        <speak>
            <prosody pitch="0st" range="low" rate="1.0">{pair[0][0]}।</prosody>
            # <break time="500ms"/>

            # <prosody pitch="0st" range="low" rate="1.0">{pair[1][0]}।</prosody>
        </speak>
        """
        # <prosody pitch="0st" range="low" rate="1.0">তার  টার</prosody>
        # <break time="500ms"/>
        # <prosody pitch="0st" range="low" rate="1.0">টার</prosody>
        sample_rate, samples = synthesize_raw_audio(
            word,
            "out.wav",
            # Path(OUTPUT_DIR) / f"{transliteration}.wav",
            speaking_rate=consistent_speaking_rate,
            pitch=consistent_pitch,
            effects_profile_id=consistent_effects_profile,
        )
        import soundfile as sf

        sf.write("out.wav", samples, sample_rate)

        splits = librosa.effects.split(samples, top_db=40)

        try:
            assert splits.shape[0] == 2
            sf.write(
                f"../public/{data['path']}/{pair[0][1]}.mp3",
                samples[splits[0][0] : splits[0][1]],
                sample_rate,
            )
            sf.write(
                f"../public/{data['path']}/{pair[1][1]}.mp3",
                samples[splits[1][0] : splits[1][1]],
                sample_rate,
            )
        except AssertionError:
            print(pair)
            print(splits)

