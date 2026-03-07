using MvvmCross;
using MvvmCross.Forms.Platforms.Android.Core;
using SheepsAndKittens.Core.Services.Interfaces;
using SheepsAndKittens.Android.Services;

namespace SheepsAndKittens.Android
{
    public class Setup : MvxFormsAndroidSetup<Core.App, Forms.FormsApp>
    {
        protected override void InitializeFirstChance()
        {
            base.InitializeFirstChance();
            Mvx.IoCProvider!.RegisterType<IHapticService, AndroidHapticService>();
            Mvx.IoCProvider!.RegisterType<ISoundService, AndroidSoundService>();
        }
    }
}
