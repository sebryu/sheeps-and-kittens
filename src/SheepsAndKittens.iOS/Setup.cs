using MvvmCross;
using MvvmCross.Forms.Platforms.Ios.Core;
using SheepsAndKittens.Core.Services.Interfaces;
using SheepsAndKittens.iOS.Services;

namespace SheepsAndKittens.iOS
{
    public class Setup : MvxFormsIosSetup<Core.App, Forms.FormsApp>
    {
        protected override void InitializeFirstChance()
        {
            base.InitializeFirstChance();
            Mvx.IoCProvider!.RegisterType<IHapticService, IosHapticService>();
            Mvx.IoCProvider!.RegisterType<ISoundService, IosSoundService>();
        }
    }
}
