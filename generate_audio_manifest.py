#!/usr/bin/env python3
# /// script
# requires-python = ">=3.12"
# dependencies = [
# "rich"
# ]
# ///

"""
Script to generate an audio manifest JSON file that lists all available audio files.
This replaces the need for the frontend to make hundreds of HEAD requests to discover files.
"""

import json
import os
from pathlib import Path
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn

console = Console()

def scan_audio_directory(audio_base_path):
    """
    Scan the audio directory and create a manifest of available files.
    
    Returns:
        dict: Manifest with structure:
        {
            "words": {
                "transliteration": {
                    "voices": ["voice1", "voice2", ...],
                    "extension": "wav|mp3"
                }
            },
            "generated_at": "ISO timestamp",
            "total_words": int,
            "total_files": int
        }
    """
    manifest = {
        "words": {},
        "generated_at": "",
        "total_words": 0,
        "total_files": 0
    }
    
    audio_path = Path(audio_base_path)
    if not audio_path.exists():
        console.print(f"[red]Audio directory not found: {audio_path}[/red]")
        return manifest
    
    # Find all word directories
    word_dirs = [d for d in audio_path.iterdir() if d.is_dir()]
    
    total_files = 0
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        console=console
    ) as progress:
        
        task = progress.add_task("Scanning audio files...", total=len(word_dirs))
        
        for word_dir in word_dirs:
            transliteration = word_dir.name
            
            # Find all audio files in this word's directory
            audio_files = []
            extensions_found = set()
            
            # Look for both wav and mp3 files
            for ext in ['wav', 'mp3']:
                pattern = f"{transliteration}_*.{ext}"
                files = list(word_dir.glob(pattern))
                if files:
                    extensions_found.add(ext)
                    for file_path in files:
                        # Extract voice name from filename: transliteration_voicename.ext
                        filename = file_path.stem  # Remove extension
                        if filename.startswith(f"{transliteration}_"):
                            voice_name = filename[len(f"{transliteration}_"):]
                            audio_files.append(voice_name)
                            total_files += 1
            
            if audio_files:
                # Use the first extension found (prefer wav over mp3)
                extension = 'wav' if 'wav' in extensions_found else 'mp3'
                
                manifest["words"][transliteration] = {
                    "voices": sorted(list(set(audio_files))),  # Remove duplicates and sort
                    "extension": extension
                }
            
            progress.update(task, advance=1, description=f"Scanned {transliteration}")
    
    # Update totals
    manifest["total_words"] = len(manifest["words"])
    manifest["total_files"] = total_files
    manifest["generated_at"] = __import__('datetime').datetime.now().isoformat()
    
    return manifest

def main():
    console.print("[bold blue]Audio Manifest Generator[/bold blue]")
    
    # Determine audio directory path
    audio_base_path = Path("public/audio/bn-IN")
    
    if not audio_base_path.exists():
        console.print(f"[red]Error: Audio directory not found at {audio_base_path}[/red]")
        console.print("Make sure you're running this script from the project root directory.")
        return
    
    console.print(f"[green]Scanning audio directory: {audio_base_path}[/green]")
    
    # Generate manifest
    manifest = scan_audio_directory(audio_base_path)
    
    if manifest["total_words"] == 0:
        console.print("[yellow]No audio files found![/yellow]")
        return
    
    # Write manifest file
    manifest_path = Path("public/audio/audio_manifest.json")
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    console.print(f"\n[bold green]✓ Audio manifest generated successfully![/bold green]")
    console.print(f"[cyan]Location:[/cyan] {manifest_path}")
    console.print(f"[cyan]Words:[/cyan] {manifest['total_words']}")
    console.print(f"[cyan]Total files:[/cyan] {manifest['total_files']}")
    console.print(f"[cyan]Generated at:[/cyan] {manifest['generated_at']}")
    
    # Show sample of what was found
    if manifest["words"]:
        console.print(f"\n[bold]Sample words found:[/bold]")
        sample_words = list(manifest["words"].items())[:5]
        for word, data in sample_words:
            voice_count = len(data["voices"])
            console.print(f"  {word}: {voice_count} voices ({data['extension']})")
        
        if len(manifest["words"]) > 5:
            console.print(f"  ... and {len(manifest['words']) - 5} more words")

if __name__ == "__main__":
    main()