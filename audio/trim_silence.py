# /// script
# requires-python = ">=3.12"
# dependencies = [
# "pydub"
# ]
# ///

import os
from pydub import AudioSegment
from pydub.silence import split_on_silence, detect_leading_silence

def trim_silence_from_file(input_filepath, output_filepath, silence_thresh=-50, min_silence_len=500, keep_silence=100):
    """
    Trims silence from the beginning and end of an audio file.

    Args:
        input_filepath (str): Path to the input audio file.
        output_filepath (str): Path to save the trimmed audio file.
        silence_thresh (int, optional): Silence threshold in dBFS. Defaults to -50.
                                        Consider this the level below which audio is considered silent.
        min_silence_len (int, optional): Minimum length of silence (in ms) to be considered for splitting.
                                         Not directly used for trimming start/end but good for context if using split_on_silence.
                                         For leading/trailing, we're more interested in just detecting it.
        keep_silence (int, optional): Amount of silence (in ms) to keep at the beginning and end. Defaults to 100ms.
    """
    try:
        audio = AudioSegment.from_mp3(input_filepath)
        print(f"Processing: {input_filepath}, Duration: {len(audio) / 1000:.2f}s")

        # Detect leading silence
        start_trim = detect_leading_silence(audio, silence_threshold=silence_thresh)
        # Detect trailing silence (by reversing the audio)
        end_trim = detect_leading_silence(audio.reverse(), silence_threshold=silence_thresh)

        # Calculate start and end points for trimming
        # Ensure we don't trim more than the audio length
        start_point = max(0, start_trim - keep_silence)
        end_point = max(0, len(audio) - (end_trim - keep_silence))

        # Ensure start_point is not after end_point
        if start_point >= end_point:
            print(f"  - Audio in {input_filepath} might be entirely silence or too short to trim. Skipping.")
            return False

        trimmed_audio = audio[start_point:end_point]

        trimmed_audio.export(output_filepath, format="mp3")
        print(f"  -> Trimmed audio saved to: {output_filepath}, New Duration: {len(trimmed_audio) / 1000:.2f}s")
        return True
    except Exception as e:
        print(f"Error processing {input_filepath}: {e}")
        return False

if __name__ == "__main__":
    audio_directory = "."  # Assumes the script is in the 'audio' directory
    output_directory = "trimmed_audio" # Subdirectory for trimmed files

    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
        print(f"Created output directory: {output_directory}")

    for filename in os.listdir(audio_directory):
        if filename.lower().endswith(".mp3"):
            input_path = os.path.join(audio_directory, filename)
            output_path = os.path.join(output_directory, filename) # Save with the same name in the new dir
            print(f"\nAttempting to trim: {filename}")
            trim_silence_from_file(input_path, output_path)