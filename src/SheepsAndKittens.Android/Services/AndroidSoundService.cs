using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Android.Content.Res;
using Android.Media;
using MvvmCross;
using MvvmCross.Platforms.Android;
using SheepsAndKittens.Core.Services.Interfaces;

namespace SheepsAndKittens.Android.Services
{
    public class AndroidSoundService : ISoundService
    {
        private SoundPool? _soundPool;
        private readonly Dictionary<SoundName, int> _soundIds = new Dictionary<SoundName, int>();

        public Task LoadAllSoundsAsync()
        {
            try
            {
                var attributes = new AudioAttributes.Builder()!
                    .SetUsage(AudioUsageKind.Game)!
                    .SetContentType(AudioContentType.Sonification)!
                    .Build();

                _soundPool = new SoundPool.Builder()!
                    .SetMaxStreams(4)!
                    .SetAudioAttributes(attributes)!
                    .Build();

                var top = Mvx.IoCProvider?.Resolve<IMvxAndroidCurrentTopActivity>();
                var context = top?.Activity;
                if (context == null) return Task.CompletedTask;

                AssetManager assets = context.Assets!;

                foreach (SoundName name in Enum.GetValues(typeof(SoundName)))
                {
                    try
                    {
                        var fd = assets.OpenFd($"{name.ToString().ToLower()}.wav");
                        int soundId = _soundPool!.Load(fd, 1);
                        _soundIds[name] = soundId;
                    }
                    catch
                    {
                        // Sound file not found
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
            if (_soundPool != null && _soundIds.TryGetValue(name, out int soundId))
            {
                _soundPool.Play(soundId, 1f, 1f, 1, 0, 1f);
            }
            return Task.CompletedTask;
        }

        public Task UnloadAllSoundsAsync()
        {
            _soundPool?.Release();
            _soundPool = null;
            _soundIds.Clear();
            return Task.CompletedTask;
        }
    }
}
