using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AVFoundation;
using Foundation;
using SheepsAndKittens.Core.Services.Interfaces;

namespace SheepsAndKittens.iOS.Services
{
    public class IosSoundService : ISoundService
    {
        private readonly Dictionary<SoundName, AVAudioPlayer> _players = new Dictionary<SoundName, AVAudioPlayer>();

        public Task LoadAllSoundsAsync()
        {
            try
            {
                AVAudioSession.SharedInstance().SetCategory(AVAudioSessionCategory.Playback);
                AVAudioSession.SharedInstance().SetActive(true);

                foreach (SoundName name in Enum.GetValues(typeof(SoundName)))
                {
                    var path = NSBundle.MainBundle.PathForResource(name.ToString().ToLower(), "wav");
                    if (path != null)
                    {
                        var url = NSUrl.FromFilename(path);
                        var player = new AVAudioPlayer(url, "wav", out _);
                        player.PrepareToPlay();
                        _players[name] = player;
                    }
                }
            }
            catch
            {
                // Silently fail on sound load errors
            }

            return Task.CompletedTask;
        }

        public Task PlaySoundAsync(SoundName name)
        {
            if (_players.TryGetValue(name, out var player))
            {
                player.CurrentTime = 0;
                player.Play();
            }
            return Task.CompletedTask;
        }

        public Task UnloadAllSoundsAsync()
        {
            foreach (var player in _players.Values)
            {
                player.Stop();
                player.Dispose();
            }
            _players.Clear();
            return Task.CompletedTask;
        }
    }
}
