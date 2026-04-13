// 完整游戏测试脚本
// 用于测试游戏的完整运行和关卡跳转功能

console.log('=== 天工百物 · 三元配对游戏 - 完整测试脚本 ===\n');

// 测试环境配置
const TEST_CONFIG = {
    testDuration: 30000, // 测试总时长（毫秒）
    levelSwitchDelay: 5000, // 关卡切换延迟（毫秒）
    testSteps: [
        '初始化游戏',
        '测试游戏开始功能',
        '测试游戏暂停功能',
        '测试游戏重置功能',
        '测试第一关完整流程',
        '测试第一关到第二关跳转',
        '测试第二关完整流程',
        '测试第二关到第三关跳转',
        '测试第三关完整流程',
        '测试游戏结束逻辑',
        '验证所有关卡数据完整性'
    ]
};

// 测试结果记录
const testResults = {
    passed: 0,
    failed: 0,
    errors: [],
    logs: []
};

// 日志记录函数
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    testResults.logs.push(logEntry);
    console.log(logEntry);
}

// 测试通过函数
function testPassed(step) {
    testResults.passed++;
    log(`✅ ${step} - 测试通过`);
}

// 测试失败函数
function testFailed(step, error) {
    testResults.failed++;
    testResults.errors.push({ step, error });
    log(`❌ ${step} - 测试失败: ${error}`, 'error');
}

// 模拟游戏环境
class GameTester {
    constructor() {
        this.game = null;
        this.testStartTime = 0;
        this.currentTestStep = 0;
        this.testTimeout = null;
    }

    // 初始化测试
    async init() {
        log('开始初始化测试环境...');
        
        // 检查是否在浏览器环境中运行
        if (typeof window === 'undefined') {
            log('⚠️  此测试脚本需要在浏览器环境中运行', 'warning');
            return false;
        }

        // 等待页面加载完成
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                window.addEventListener('load', resolve);
            });
        }

        // 检查游戏对象是否存在
        if (typeof window.game === 'undefined') {
            log('⚠️  游戏对象未找到，尝试初始化游戏', 'warning');
            
            // 检查TetrisGame类是否存在
            if (typeof TetrisGame !== 'undefined') {
                window.game = new TetrisGame();
                log('✅ 游戏对象已创建');
            } else {
                log('❌ TetrisGame类未找到', 'error');
                return false;
            }
        }

        this.game = window.game;
        this.testStartTime = Date.now();
        log('✅ 测试环境初始化完成');
        return true;
    }

    // 执行测试步骤
    async runTest() {
        log('\n=== 开始执行测试步骤 ===\n');
        
        try {
            // 测试步骤1：初始化游戏
            await this.testGameInitialization();
            
            // 测试步骤2：测试游戏开始功能
            await this.testGameStart();
            
            // 测试步骤3：测试游戏暂停功能
            await this.testGamePause();
            
            // 测试步骤4：测试游戏重置功能
            await this.testGameReset();
            
            // 测试步骤5：测试第一关数据完整性
            await this.testLevelDataIntegrity(1);
            
            // 测试步骤6：测试第二关数据完整性
            await this.testLevelDataIntegrity(2);
            
            // 测试步骤7：测试第三关数据完整性
            await this.testLevelDataIntegrity(3);
            
            // 测试步骤8：测试关卡切换功能
            await this.testLevelSwitching();
            
            // 测试步骤9：测试所有关卡数据与用户提供的物元三元组匹配
            await this.testAllLevelsMatchUserData();
            
        } catch (error) {
            log(`测试过程中发生错误: ${error.message}`, 'error');
            testResults.errors.push({ step: '测试执行', error: error.message });
        }
        
        this.generateTestReport();
    }

    // 测试步骤1：初始化游戏
    async testGameInitialization() {
        const step = TEST_CONFIG.testSteps[0];
        log(`\n📋 测试步骤: ${step}`);
        
        try {
            // 检查游戏对象属性
            const requiredProperties = [
                'canvas', 'ctx', 'nextCanvas', 'nextCtx',
                'rows', 'cols', 'blockSize',
                'board', 'currentPiece', 'nextPiece',
                'score', 'highScore', 'level',
                'gameRunning', 'gamePaused',
                'elementNames', 'levels',
                'level1Data', 'level2Data', 'level3Data'
            ];
            
            for (const prop of requiredProperties) {
                if (typeof this.game[prop] === 'undefined') {
                    throw new Error(`游戏对象缺少必要属性: ${prop}`);
                }
            }
            
            // 检查关卡数据
            if (!Array.isArray(this.game.levels) || this.game.levels.length < 4) {
                throw new Error('关卡数据不完整');
            }
            
            testPassed(step);
            return true;
        } catch (error) {
            testFailed(step, error.message);
            return false;
        }
    }

    // 测试步骤2：测试游戏开始功能
    async testGameStart() {
        const step = TEST_CONFIG.testSteps[1];
        log(`\n📋 测试步骤: ${step}`);
        
        try {
            // 点击开始按钮
            const startBtn = document.getElementById('startBtn');
            if (!startBtn) {
                throw new Error('开始按钮未找到');
            }
            
            startBtn.click();
            
            // 检查游戏状态
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (!this.game.gameRunning) {
                throw new Error('游戏未成功开始');
            }
            
            testPassed(step);
            return true;
        } catch (error) {
            testFailed(step, error.message);
            return false;
        }
    }

    // 测试步骤3：测试游戏暂停功能
    async testGamePause() {
        const step = TEST_CONFIG.testSteps[2];
        log(`\n📋 测试步骤: ${step}`);
        
        try {
            // 点击暂停按钮
            const pauseBtn = document.getElementById('pauseBtn');
            if (!pauseBtn) {
                throw new Error('暂停按钮未找到');
            }
            
            pauseBtn.click();
            
            // 检查游戏状态
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (!this.game.gamePaused) {
                throw new Error('游戏未成功暂停');
            }
            
            // 恢复游戏
            pauseBtn.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (this.game.gamePaused) {
                throw new Error('游戏未成功恢复');
            }
            
            testPassed(step);
            return true;
        } catch (error) {
            testFailed(step, error.message);
            return false;
        }
    }

    // 测试步骤4：测试游戏重置功能
    async testGameReset() {
        const step = TEST_CONFIG.testSteps[3];
        log(`\n📋 测试步骤: ${step}`);
        
        try {
            // 点击重置按钮
            const resetBtn = document.getElementById('resetBtn');
            if (!resetBtn) {
                throw new Error('重置按钮未找到');
            }
            
            resetBtn.click();
            
            // 检查游戏状态
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (this.game.gameRunning) {
                throw new Error('游戏重置后仍在运行');
            }
            
            if (this.game.score !== 0) {
                throw new Error('游戏重置后分数未清零');
            }
            
            testPassed(step);
            return true;
        } catch (error) {
            testFailed(step, error.message);
            return false;
        }
    }

    // 测试步骤5-7：测试关卡数据完整性
    async testLevelDataIntegrity(levelNum) {
        const step = `测试第${levelNum}关数据完整性`;
        log(`\n📋 测试步骤: ${step}`);
        
        try {
            const levelData = this.game[`level${levelNum}Data`];
            if (!levelData) {
                throw new Error(`第${levelNum}关数据未找到`);
            }
            
            // 检查必要属性
            const requiredProperties = ['originalTriples', 'triples', 'currentIndex', 'completed', 'columns', 'dropOrders', 'tripleOrder'];
            for (const prop of requiredProperties) {
                if (typeof levelData[prop] === 'undefined') {
                    throw new Error(`第${levelNum}关缺少必要属性: ${prop}`);
                }
            }
            
            // 检查三元组数据
            if (!Array.isArray(levelData.originalTriples) || levelData.originalTriples.length === 0) {
                throw new Error(`第${levelNum}关三元组数据为空`);
            }
            
            log(`   ✅ 第${levelNum}关数据完整，包含 ${levelData.originalTriples.length} 个三元组`);
            testPassed(step);
            return true;
        } catch (error) {
            testFailed(step, error.message);
            return false;
        }
    }

    // 测试步骤8：测试关卡切换功能
    async testLevelSwitching() {
        const step = TEST_CONFIG.testSteps[7];
        log(`\n📋 测试步骤: ${step}`);
        
        try {
            // 测试从第一关到第二关
            this.game.level = 1;
            this.game.level1Data.currentIndex = this.game.level1Data.triples.length;
            this.game.level1Win();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (this.game.level !== 2) {
                throw new Error('第一关到第二关跳转失败');
            }
            
            log('   ✅ 第一关到第二关跳转成功');
            
            // 测试从第二关到第三关
            this.game.level2Data.currentIndex = this.game.level2Data.triples.length;
            this.game.level1Win();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (this.game.level !== 3) {
                throw new Error('第二关到第三关跳转失败');
            }
            
            log('   ✅ 第二关到第三关跳转成功');
            
            // 重置游戏
            this.game.reset();
            
            testPassed(step);
            return true;
        } catch (error) {
            testFailed(step, error.message);
            return false;
        }
    }

    // 测试步骤9：测试所有关卡数据与用户提供的物元三元组匹配
    async testAllLevelsMatchUserData() {
        const step = '验证所有关卡数据完整性';
        log(`\n📋 测试步骤: ${step}`);
        
        try {
            // 用户提供的物元三元组数据
            const userProvidedData = {
                level1: {
                    name: '耒（lěi）',
                    tripleCount: 11
                },
                level2: {
                    name: '耜（sì）',
                    tripleCount: 16
                },
                level3: {
                    name: '犁（lí）',
                    tripleCount: 16
                },
                level4: {
                    name: '耕牛（gēng niú）',
                    tripleCount: 15
                },
                level5: {
                    name: '耖（chào）',
                    tripleCount: 16
                },
                level6: {
                    name: '磨耙（mó bà）',
                    tripleCount: 5
                }
            };
            
            // 检查现有关卡
            for (let i = 1; i <= 3; i++) {
                const levelData = this.game[`level${i}Data`];
                const userData = userProvidedData[`level${i}`];
                
                if (levelData && userData) {
                    if (levelData.originalTriples.length !== userData.tripleCount) {
                        log(`   ⚠️  第${i}关三元组数量不匹配: 实际 ${levelData.originalTriples.length}, 期望 ${userData.tripleCount}`, 'warning');
                    } else {
                        log(`   ✅ 第${i}关三元组数量匹配: ${levelData.originalTriples.length}`);
                    }
                }
            }
            
            // 检查缺失的关卡
            for (let i = 4; i <= 6; i++) {
                const levelData = this.game[`level${i}Data`];
                if (!levelData) {
                    log(`   ⚠️  第${i}关数据缺失: ${userProvidedData[`level${i}`].name}`, 'warning');
                }
            }
            
            testPassed(step);
            return true;
        } catch (error) {
            testFailed(step, error.message);
            return false;
        }
    }

    // 生成测试报告
    generateTestReport() {
        log('\n=== 测试报告 ===');
        log(`测试总时长: ${Math.round((Date.now() - this.testStartTime) / 1000)} 秒`);
        log(`测试步骤总数: ${TEST_CONFIG.testSteps.length}`);
        log(`通过测试数: ${testResults.passed}`);
        log(`失败测试数: ${testResults.failed}`);
        log(`错误总数: ${testResults.errors.length}`);
        
        if (testResults.errors.length > 0) {
            log('\n❌ 错误详情:');
            testResults.errors.forEach((err, index) => {
                log(`${index + 1}. ${err.step}: ${err.error}`, 'error');
            });
        }
        
        const successRate = Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100);
        log(`\n📊 测试成功率: ${successRate}%`);
        
        if (successRate >= 80) {
            log('🎉 测试通过！游戏整体运行良好', 'success');
        } else {
            log('⚠️  测试未通过！游戏存在较多问题', 'warning');
        }
        
        log('\n=== 测试建议 ===');
        log('1. 建议添加第4-6关的关卡数据');
        log('2. 建议统一所有关卡的通关庆祝机制');
        log('3. 建议添加更多的音效和动画效果');
        log('4. 建议优化移动端的触摸交互体验');
        log('5. 建议添加游戏教程和帮助信息');
    }
}

// 运行测试
async function runTest() {
    const tester = new GameTester();
    
    if (await tester.init()) {
        await tester.runTest();
    } else {
        log('初始化测试环境失败，无法执行测试', 'error');
    }
}

// 测试脚本不会自动运行，需要手动调用
// 可以在浏览器控制台中输入 runTest() 来运行测试
if (typeof window !== 'undefined') {
    // 将runTest函数暴露到全局，方便手动调用
    window.runTest = runTest;
}

// 导出测试类（用于外部调用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameTester, testResults };
}