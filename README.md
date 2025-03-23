# LightBrowser

A minimal and lightweight browser made with HTML, optimized to run on Android 5.0+ and lower-end devices.

## Features

- **Lightweight**: Designed to be minimal and efficient, ensuring smooth performance even on lower-end devices.
- **Compatibility**: Runs seamlessly on Android 5.0 and above.
- **User-friendly Interface**: Simple and intuitive interface for easy navigation.

## Technologies Used

- **JavaScript**: 58.4%
- **CSS**: 22%
- **HTML**: 19.6%
- **Cordova**: For building the native Android app

## Installation

### Using Pre-built APK

1. Download the latest `app_debug.apk` from the [releases page](https://github.com/DaDevMikey/LightBrowser/releases).
2. Transfer the APK to your Android device.
3. Open the APK file to install the app.

### Building from Source

To build and run LightBrowser from source using Cordova, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/DaDevMikey/LightBrowser.git
   ```
2. Navigate to the project directory:
   ```bash
   cd LightBrowser
   ```
3. Ensure you have Cordova installed:
   ```bash
   npm install -g cordova
   ```
4. Add the Android platform:
   ```bash
   cordova platform add android
   ```
5. Build the project:
   ```bash
   cordova build android
   ```
6. The APK can be found in the `platforms/android/app/build/outputs/apk/debug/` directory.

## Usage

1. Clone the repository to your local machine.
2. Open the project directory.
3. You can either open `index.html` in your browser or follow the steps in the Installation section to run it as a native Android app.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or issues, please contact [DaDevMikey](https://github.com/DaDevMikey).
