import { isOn } from "@/lib/settings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useEffect } from "react";

async function soundOn() {
  const v = await AsyncStorage.getItem("sound");
  return v !== "off";
}

export function useGameSounds() {
  const spin = useAudioPlayer(require("@/assets/sounds/spin.mp3"));
  const win = useAudioPlayer(require("@/assets/sounds/win.mp3"));
  const bigWin = useAudioPlayer(require("@/assets/sounds/bigwin.mp3"));

  useEffect(() => {
    spin.loop = true;
    setAudioModeAsync({ playsInSilentMode: true });
  }, [spin]);

  async function playSpin() {
    if (!isOn("sound")) return;
    await spin.seekTo(0);
    spin.play();
  }

  function stopSpin() {
    spin.pause();
  }
  async function playWin() {
    if (!isOn("sound")) return;
    await win.seekTo(0);
    win.play();
  }

  async function playBigWin() {
    if (!isOn("sound")) return;
    await bigWin.seekTo(0);
    bigWin.play();
  }

  return { playSpin, stopSpin, playWin, playBigWin };
}
