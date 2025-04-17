class GoogleAnalyticsManager {
  private static googleEvent(
    name: (string & {}) | Gtag.EventNames,
    params?:
      | Gtag.CustomParams
      | Gtag.ControlParams
      | Gtag.EventParams
      | undefined
  ) {
    gtag("event", name, params);
  }
  static DarkModeClicked() {
    GoogleAnalyticsManager.googleEvent("darkModeClicked");
  }

  static PlanetToggleClicked() {
    GoogleAnalyticsManager.googleEvent("planetToggleClicked");
  }
  static MenuOpened() {
    GoogleAnalyticsManager.googleEvent("menuOpened");
  }

  static WaveformClicked() {
    GoogleAnalyticsManager.googleEvent("waveformClicked");
  }
  static FlowerClicked() {
    GoogleAnalyticsManager.googleEvent("flowerClicked");
  }
  static WinspearClicked() {
    GoogleAnalyticsManager.googleEvent("winspearClicked");
  }
  static PlayPauseMenuClicked() {
    GoogleAnalyticsManager.googleEvent("playPauseMenuClicked");
  }
  static SmokingClicked() {
    GoogleAnalyticsManager.googleEvent("smokingClicked");
  }
  static AirplaneModeClicked() {
    GoogleAnalyticsManager.googleEvent("airplaneModeClicked");
  }
}

export default GoogleAnalyticsManager;
