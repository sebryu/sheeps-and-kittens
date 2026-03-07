using System.Threading.Tasks;
using Android.Content;
using Android.OS;
using MvvmCross;
using MvvmCross.Platforms.Android;
using SheepsAndKittens.Core.Services.Interfaces;

namespace SheepsAndKittens.Android.Services
{
    public class AndroidHapticService : IHapticService
    {
        public Task TriggerHapticAsync(HapticEvent hapticEvent)
        {
            try
            {
                var top = Mvx.IoCProvider?.Resolve<IMvxAndroidCurrentTopActivity>();
                var activity = top?.Activity;
                if (activity == null) return Task.CompletedTask;

                var vibrator = (Vibrator?)activity.GetSystemService(Context.VibratorService);
                if (vibrator == null || !vibrator.HasVibrator) return Task.CompletedTask;

                if (Build.VERSION.SdkInt >= BuildVersionCodes.O)
                {
                    VibrationEffect effect;
                    switch (hapticEvent)
                    {
                        case HapticEvent.Select:
                        case HapticEvent.Move:
                            effect = VibrationEffect.CreateOneShot(20, 80);
                            break;
                        case HapticEvent.Place:
                            effect = VibrationEffect.CreateOneShot(40, 150);
                            break;
                        case HapticEvent.Capture:
                            effect = VibrationEffect.CreateOneShot(60, 255);
                            break;
                        case HapticEvent.Win:
                            effect = VibrationEffect.CreateWaveform(new long[] { 0, 100, 50, 100 }, -1);
                            break;
                        case HapticEvent.Invalid:
                            effect = VibrationEffect.CreateOneShot(30, 100);
                            break;
                        case HapticEvent.PhaseChange:
                            effect = VibrationEffect.CreateWaveform(new long[] { 0, 50, 50, 30 }, -1);
                            break;
                        default:
                            return Task.CompletedTask;
                    }
                    vibrator.Vibrate(effect);
                }
                else
                {
#pragma warning disable CS0618
                    vibrator.Vibrate(30);
#pragma warning restore CS0618
                }
            }
            catch
            {
                // Silently fail on haptic errors
            }

            return Task.CompletedTask;
        }
    }
}
