#!/usr/bin/env python3
"""
Script to identify and delete audio files that are significantly smaller than their peers.
This helps clean up failed recordings that only contain headers or very brief audio.
"""

import json
from pathlib import Path
import statistics

def analyze_and_clean_audio_files(data_file=None, dry_run=True, min_threshold=0.3):
    """
    Analyze audio files and delete those significantly smaller than peers.
    
    Args:
        data_file: Path to the minimal pairs JSON data
        dry_run: If True, only report what would be deleted without actually deleting
        min_threshold: Files smaller than this ratio of the median size will be deleted
    """
    # Use relative path from script location
    if data_file is None:
        data_file = Path(__file__).parent / "public" / "minimal_pairs_db.json"
    else:
        data_file = Path(__file__).parent / data_file
    
    # Load data
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Get Bengali data
    lang_data = data.get('bn-IN', {})
    audio_base_path = Path(__file__).parent / 'public' / lang_data.get('audioBasePath', 'audio/bn-IN')
    
    print(f"Analyzing audio files in: {audio_base_path}")
    print(f"Threshold: Files < {min_threshold:.1%} of median size will be {'marked for deletion' if dry_run else 'deleted'}")
    print()
    
    total_analyzed = 0
    total_small_files = 0
    total_deleted = 0
    
    # Analyze each word directory
    for word_dir in audio_base_path.iterdir():
        if not word_dir.is_dir():
            continue
            
        word_name = word_dir.name
        audio_files = list(word_dir.glob("*.wav")) + list(word_dir.glob("*.mp3"))
        
        if len(audio_files) < 2:
            continue  # Need at least 2 files to compare
            
        # Get file sizes
        file_sizes = []
        file_info = []
        
        for audio_file in audio_files:
            size = audio_file.stat().st_size
            file_sizes.append(size)
            file_info.append({'path': audio_file, 'size': size})
            total_analyzed += 1
        
        if len(file_sizes) < 2:
            continue
            
        # Calculate statistics
        median_size = statistics.median(file_sizes)
        mean_size = statistics.mean(file_sizes)
        min_size = min(file_sizes)
        max_size = max(file_sizes)
        
        # Find small files (those significantly smaller than median)
        threshold_size = median_size * min_threshold
        small_files = [f for f in file_info if f['size'] < threshold_size]
        
        if small_files:
            print(f"📁 {word_name}:")
            print(f"   Files: {len(audio_files)}, Median: {median_size:,} bytes, Range: {min_size:,} - {max_size:,}")
            print(f"   Threshold: {threshold_size:,.0f} bytes")
            
            for small_file in small_files:
                size_ratio = small_file['size'] / median_size
                print(f"   {'❌ WOULD DELETE' if dry_run else '🗑️  DELETING'}: {small_file['path'].name}")
                print(f"      Size: {small_file['size']:,} bytes ({size_ratio:.1%} of median)")
                
                total_small_files += 1
                
                if not dry_run:
                    try:
                        small_file['path'].unlink()
                        total_deleted += 1
                        print(f"      ✅ Deleted successfully")
                    except Exception as e:
                        print(f"      ❌ Failed to delete: {e}")
            print()
    
    print(f"Summary:")
    print(f"  Total files analyzed: {total_analyzed}")
    print(f"  Small files found: {total_small_files}")
    if not dry_run:
        print(f"  Files deleted: {total_deleted}")
    else:
        print(f"  Files that would be deleted: {total_small_files}")
        print(f"\nTo actually delete files, run with --delete flag")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Clean up small audio files")
    parser.add_argument("--delete", action="store_true", help="Actually delete files (default: dry run)")
    parser.add_argument("--threshold", type=float, default=0.3, help="Size threshold ratio (default: 0.3)")
    parser.add_argument("--data-file", default=None, help="Path to data file (relative to script location)")
    
    args = parser.parse_args()
    
    analyze_and_clean_audio_files(
        data_file=args.data_file,
        dry_run=not args.delete,
        min_threshold=args.threshold
    )