# Tiangong Baiwu · Triad Matching Game

## 📖 Project Introduction

This is an educational mini-game based on the Tetris mechanism, designed to help players learn the matter-element knowledge (object, feature, value triad) of traditional Chinese farming tools through gameplay. Players need to correctly place the falling blocks into the corresponding columns to complete the matching of matter-element triads.

## 🎮 Game Mechanics

### Core Gameplay
- The game board is divided into three columns: **Object Column**, **Feature Column**, **Value Column**
- Block shape: Uniformly 1×4 rectangular bars
- Each block contains text information (object name/feature/value)
- Blocks must be placed in the correct column to score points
- Progress to the next level after completing all triad matchings

### Level Design
- **Level 1 - 耒（lěi）[Ancient Chinese plowing tool]**
- **Level 2 - 耜（sì）[Ancient Chinese plowshare]**
- **Level 3 - 犁（lí）[Plow]**
- **Level 4 - 耕牛（gēng niú）[Farming Ox]**
- **Level 5 - 耖（chào）[Ancient Chinese harrowing tool]**
- **Level 6 - 磨耙（mó bà）[Grinding harrow]**
- **Level 7 - 秧弹（yāng dàn）[Seedling bullet]**
- **Level 8 - 耧车（lóu chē）[Ancient Chinese seed drill]**
- **Level 9 - 稻麦藁包（dào mài gǎo bāo）[Rice and wheat straw bale]**
- **Level 10 - 秧马（yāng mǎ）[Seedling horse]**
- Supports expansion of additional levels

## 🏗️ Technical Architecture

### File Structure
```
els/
├── index.html          # Main HTML file
├── style.css          # Style file
├── script.js          # Game logic (main file)
└── README.md          # Project documentation (this file)
```

## 🎨 Color System

The game uses a systematic color index:

```javascript
// Index 0: Empty block
// Indexes 1-3: Bottom label colors (Object, Feature, Value)
// Indexes 4-6: Column colors for Matter-element 1 (Lei)
// Indexes 7-9: Column colors for Matter-element 2 (Leitou/Lei head)
// ...and so on
```

### Color Rules
- **Object Column**: Blue/Purple tones
- **Feature Column**: Green tones
- **Value Column**: Red/Orange tones

## 🎮 Operation Instructions

### Keyboard Controls
- **←/→ Arrow Keys**: Move blocks left/right
- **↓ Arrow Key**: Accelerate falling
- **Space Bar**: Instant drop to the bottom

### Touch Controls
- **Swipe left/right**: Move blocks
- **Swipe down**: Accelerate falling

### Button Controls
- **Start**: Start the game
- **Pause**: Pause/Resume the game
- **Restart**: Reset the game to Level 1
- **Direction Buttons**: Virtual buttons for touch devices

## 📦 Deployment Instructions

### Local Running
Simply open `index.html` with a browser to run the game.

### Server Deployment
Upload the entire `els` folder to a web server.

### Notes
- Ensure all files use UTF-8 encoding (to support Chinese display)
- It is recommended to use modern browsers (Chrome, Firefox, Safari, Edge)

## 📄 License

This project is developed for educational purposes only.

## 👨‍💻 Maintainers

For questions or suggestions, please contact the project maintainers.

---

**Last Updated**: 2025-11-30

**Version**: 2.0.0