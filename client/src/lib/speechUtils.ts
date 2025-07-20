// Speech synthesis utility for Smart Parking System
export const speakMessage = (message: string) => {
  // Check if the browser supports the Web Speech API
  if ('speechSynthesis' in window) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.volume = 1; // 0 to 1
    speech.rate = 0.9; // 0.1 to 10 (slightly slower for better clarity)
    speech.pitch = 1; // 0 to 2
    window.speechSynthesis.speak(speech);
  } else {
    console.log('Speech synthesis not supported in this browser');
  }
};
