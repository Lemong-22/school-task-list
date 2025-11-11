import { Howl } from 'howler';

// Sound effects using free sound URLs
const sounds = {
  coin: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'],
    volume: 0.5,
  }),
  success: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'],
    volume: 0.5,
  }),
  levelUp: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'],
    volume: 0.5,
  }),
  click: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'],
    volume: 0.3,
  }),
};

export const playSound = (soundName: keyof typeof sounds) => {
  sounds[soundName]?.play();
};
