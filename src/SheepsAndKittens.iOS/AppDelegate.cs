using Foundation;
using MvvmCross.Forms.Platforms.Ios.Core;
using UIKit;

namespace SheepsAndKittens.iOS
{
    [Register("AppDelegate")]
    public class AppDelegate : MvxFormsApplicationDelegate<Setup, Core.App, Forms.FormsApp>
    {
    }
}
