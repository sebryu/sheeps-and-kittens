using System.Threading.Tasks;
using SheepsAndKittens.Core.Services.Interfaces;
using UIKit;

namespace SheepsAndKittens.iOS.Services
{
    public class IosHapticService : IHapticService
    {
        public Task TriggerHapticAsync(HapticEvent hapticEvent)
        {
            switch (hapticEvent)
            {
                case HapticEvent.Select:
                case HapticEvent.Move:
                    var lightGenerator = new UIImpactFeedbackGenerator(UIImpactFeedbackStyle.Light);
                    lightGenerator.Prepare();
                    lightGenerator.ImpactOccurred();
                    break;

                case HapticEvent.Place:
                    var mediumGenerator = new UIImpactFeedbackGenerator(UIImpactFeedbackStyle.Medium);
                    mediumGenerator.Prepare();
                    mediumGenerator.ImpactOccurred();
                    break;

                case HapticEvent.Capture:
                    var heavyGenerator = new UIImpactFeedbackGenerator(UIImpactFeedbackStyle.Heavy);
                    heavyGenerator.Prepare();
                    heavyGenerator.ImpactOccurred();
                    break;

                case HapticEvent.Win:
                    var successGenerator = new UINotificationFeedbackGenerator();
                    successGenerator.Prepare();
                    successGenerator.NotificationOccurred(UINotificationFeedbackType.Success);
                    break;

                case HapticEvent.Invalid:
                    var errorGenerator = new UINotificationFeedbackGenerator();
                    errorGenerator.Prepare();
                    errorGenerator.NotificationOccurred(UINotificationFeedbackType.Error);
                    break;

                case HapticEvent.PhaseChange:
                    var phaseGen1 = new UIImpactFeedbackGenerator(UIImpactFeedbackStyle.Medium);
                    phaseGen1.Prepare();
                    phaseGen1.ImpactOccurred();
                    Task.Delay(100).Wait();
                    var phaseGen2 = new UIImpactFeedbackGenerator(UIImpactFeedbackStyle.Light);
                    phaseGen2.Prepare();
                    phaseGen2.ImpactOccurred();
                    break;
            }

            return Task.CompletedTask;
        }
    }
}
