# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep llama.rn native library
-keep class com.rnllama.** { *; }
-keep class com.rnllama.LlamaContext { *; }
-keepclassmembers class com.rnllama.** { *; }

# Keep react-native-config
-keep class com.lugg.ReactNativeConfig.** { *; }
-keep class com.lugg.RNCConfig.** { *; }

# Keep react-native-maps
-keep class com.google.android.gms.maps.** { *; }
-keep class com.airbnb.android.react.maps.** { *; }

# Keep AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keep RNFS
-keep class com.rnfs.** { *; }

# Keep image picker
-keep class com.imagepicker.** { *; }
-keep class com.reactnativeimagepicker.** { *; }

# Keep device info
-keep class com.learnium.RNDeviceInfo.** { *; }

# Keep geolocation
-keep class com.reactnativecommunity.geolocation.** { *; }

# Keep slider
-keep class com.reactnativecommunity.slider.** { *; }

# Keep picker
-keep class com.reactnativecommunity.picker.** { *; }

# Keep markdown display
-keep class com.iamacup.markdowndisplay.** { *; }

# Keep safe area context
-keep class com.th3rdwave.safeareacontext.** { *; }

# Disabling obfuscation is useful if you collect stack traces from production crashes
-dontobfuscate

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
