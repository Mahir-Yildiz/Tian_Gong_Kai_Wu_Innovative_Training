// 俄罗斯方块游戏主程序
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetris');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');

        // 游戏设置
        this.rows = 20;
        this.cols = 12; // 12列，适配2x4尺寸的方块
        this.blockSize = 25; // 调整为25px，确保12格正好填满300px的canvas宽度

        // 游戏状态
        this.board = this.createBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.comboCount = 0; // 连击计数
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoopId = null;
        this.dropInterval = 1000; // 初始下落速度（毫秒）
        this.lastDropTime = 0;
        this.levelCompleted = false;
        this.showLabels = false; // 控制底部固定标签是否显示
        this.completedLevels = JSON.parse(localStorage.getItem('completedLevels')) || []; // 从localStorage初始化已完成的关卡

        // 物元名称数组 - 对应每个关卡
        this.elementNames = [
            '', // 占位符（索引0不使用）
            '耒（lěi）', // 第一关
            '耜（sì）',  // 第二关
            '犁（lí）',  // 第三关
            '耕牛（gēng niú）', // 第四关
            '耖（chào）', // 第五关
            '磨耙（mó bà）',  // 第六关
            '秧弹（yāng dàn）',  // 第七关
            '耧车（lóu chē）',  // 第八关
            '稻麦藁包（dào mài gǎo bāo）',  // 第九关
            '秧马（yāng mǎ）'  // 第十关
        ];
        
        // 初始化关卡选择界面
        this.updateLevelSelectUI();

        // 方块形状定义 - 统一为1x4尺寸
        this.shapes = {
            // 1x4 条形方块 (三种颜色变体)
            I: [
                [1, 1, 1, 1]
            ],
            A: [
                [1, 1, 1, 1]
            ],
            B: [
                [1, 1, 1, 1]
            ]
        };

        // 方块颜色 - 新的颜色系统设计
        // 索引0: 空方块
        // 索引1-3: 底部标签颜色（对象、特征、量值）
        // 索引4-6: 物元1（耒）的对象、特征、量值颜色
        // 索引7-9: 物元2（耒头）的对象、特征、量值颜色
        // 索引10-12: 物元3（耒柄）的对象、特征、量值颜色
        // 索引13-15: 物元4（耜）的对象、特征、量值颜色
        // 索引16-18: 物元5（耜头）的对象、特征、量值颜色
        // 索引19-21: 物元6（耜柄）的对象、特征、量值颜色
        // 索引22-24: 物元7（踏肩/踏脚处）的对象、特征、量值颜色
        this.colors = [
            null, // 空方块 (索引0)
            '#1E88E5', // 底部标签 - 对象 (蓝色系)
            '#43A047', // 底部标签 - 特征 (绿色系) 
            '#E53935', // 底部标签 - 量值 (红色系)
            '#89CFF0', // 物元1 - 对象 (耒) - 浅蓝色
            '#84C98B', // 物元1 - 特征 (耒的特征) - 浅绿色
            '#FF6A6A', // 物元1 - 量值 (耒的量值) - 浅红色
            '#0096FF', // 物元2 - 对象 (耒头) - 中蓝色
            '#40BA8D', // 物元2 - 特征 (耒头的特征) - 中绿色
            '#EE6363', // 物元2 - 量值 (耒头的量值) - 中红色
            '#6495ED', // 物元3 - 对象 (耒柄) - 亮蓝色
            '#26896D', // 物元3 - 特征 (耒柄的特征) - 深绿色
            '#CD5555', // 物元3 - 量值 (耒柄的量值) - 深红色
            '#7B68EE', // 物元4 - 对象 (耜) - 紫色
            '#98FB98', // 物元4 - 特征 (耜的特征) - 淡绿色
            '#FFA07A', // 物元4 - 量值 (耜的量值) - 淡珊瑚色
            '#9370DB', // 物元5 - 对象 (耜头) - 中紫色
            '#90EE90', // 物元5 - 特征 (耜头的特征) - 中淡绿色
            '#FA8072', // 物元5 - 量值 (耜头的量值) - 三文鱼色
            '#8A2BE2', // 物元6 - 对象 (耜柄) - 蓝紫色
            '#32CD32', // 物元6 - 特征 (耜柄的特征) - 酸橙绿
            '#DC143C', // 物元6 - 量值 (耜柄的量值) - 深红色
            '#483D8B', // 物元7 - 对象 (踏肩/踏脚处) - 暗岩蓝
            '#00CED1', // 物元7 - 特征 (踏肩/踏脚处的特征) - 暗青色
            '#FF4500', // 物元7 - 量值 (踏肩/踏脚处的量值) - 橙红色
            '#1A5276', // 物元8 - 对象 (犁) - 深海蓝
            '#52C41A', // 物元8 - 特征 (犁的特征) - 深绿色
            '#E74C3C', // 物元8 - 量值 (犁的量值) - 鲜红色
            '#3498DB', // 物元9 - 对象 (犁铧) - 亮蓝色
            '#2ECC71', // 物元9 - 特征 (犁铧的特征) - 薄荷绿
            '#F39C12', // 物元9 - 量值 (犁铧的量值) - 橙色
            '#2980B9', // 物元10 - 对象 (犁壁) - 蓝绿色
            '#27AE60', // 物元10 - 特征 (犁壁的特征) - 深绿色
            '#E67E22', // 物元10 - 量值 (犁壁的量值) - 橙红色
            '#8E44AD', // 物元11 - 对象 (犁辕) - 紫色
            '#16A085', // 物元11 - 特征 (犁辕的特征) - 青绿色
            '#D35400', // 物元11 - 量值 (犁辕的量值) - 深橙色
            '#117A65', // 物元12 - 对象 (犁箭) - 深绿色
            '#1ABC9C', // 物元12 - 特征 (犁箭的特征) - 绿松石色
            '#C0392B',  // 物元12 - 量值 (犁箭的量值) - 深红色
            '#6A5ACD',  // 物元13 - 对象 (耕牛) - 蓝色系（中紫色）
            '#4ECDC4',  // 物元13 - 特征 (耕牛的特征) - 绿色系（青绿色）
            '#FF6B6B',  // 物元13 - 量值 (耕牛的量值) - 红色系（粉红色）
            '#4169E1',  // 物元14 - 对象 (躯干) - 蓝色系（皇家蓝）
            '#52C41A',  // 物元14 - 特征 (躯干的特征) - 绿色系（深绿色）
            '#FF8C42',  // 物元14 - 量值 (躯干的量值) - 红色系（橙色）
            '#1E90FF',  // 物元15 - 对象 (蹄足) - 蓝色系（道奇蓝）
            '#95DE64',  // 物元15 - 特征 (蹄足的特征) - 绿色系（浅绿色）
            '#FF7875',  // 物元15 - 量值 (蹄足的量值) - 红色系（浅红色）
            '#6495ED',  // 物元16 - 对象 (耖) - 蓝色系（中蓝色）
            '#90EE90',  // 物元16 - 特征 (耖的特征) - 绿色系（浅绿色）
            '#FF6B6B',  // 物元16 - 量值 (耖的量值) - 红色系（粉红色）
            '#4682B4',  // 物元17 - 对象 (耖齿) - 蓝色系（钢蓝色）
            '#7FFF00',  // 物元17 - 特征 (耖齿的特征) - 绿色系（黄绿色）
            '#FF4757',  // 物元17 - 量值 (耖齿的量值) - 红色系（红色）
            '#1E90FF',  // 物元18 - 对象 (耖框) - 蓝色系（道奇蓝）
            '#2ECC71',  // 物元18 - 特征 (耖框的特征) - 绿色系（薄荷绿）
            '#E74C3C',  // 物元18 - 量值 (耖框的量值) - 红色系（深红色）
            '#6A5ACD',  // 物元19 - 对象 (耖辕/牵引杆) - 蓝色系（中紫色）
            '#27AE60',  // 物元19 - 特征 (耖辕/牵引杆的特征) - 绿色系（深绿色）
            '#C0392B',  // 物元19 - 量值 (耖辕/牵引杆的量值) - 红色系（深红色）
            '#4169E1',  // 物元20 - 对象 (磨耙) - 蓝色系（皇家蓝）
            '#16A085',  // 物元20 - 特征 (磨耙的特征) - 绿色系（青绿色）
            '#E67E22',  // 物元20 - 量值 (磨耙的量值) - 红色系（橙色）
            '#3D5A80',  // 物元21 - 对象 (秧弹) - 蓝色系（深蓝色）
            '#98C1D9',  // 物元21 - 特征 (秧弹的特征) - 蓝色系（浅蓝色）
            '#EE6C4D',  // 物元21 - 量值 (秧弹的量值) - 红色系（橙红色）
            '#2A9D8F',  // 物元22 - 对象 (绳索主体) - 绿色系（蓝绿色）
            '#E9C46A',  // 物元22 - 特征 (绳索主体的特征) - 黄色系（沙褐色）
            '#F4A261',  // 物元22 - 量值 (绳索主体的量值) - 红色系（橙黄色）
            '#264653',  // 物元23 - 对象 (固定件) - 蓝色系（深青色）
            '#8338EC',  // 物元23 - 特征 (固定件的特征) - 紫色系（深紫色）
            '#FB5607',  // 物元23 - 量值 (固定件的量值) - 红色系（橙红色）
            '#3B82F6',  // 物元24 - 对象 (耧车) - 蓝色系（亮蓝色）
            '#4ADE80',  // 物元24 - 特征 (耧车的特征) - 绿色系（浅绿色）
            '#F87171',  // 物元24 - 量值 (耧车的量值) - 红色系（浅红色）
            '#6366F1',  // 物元25 - 对象 (耧架) - 蓝色系（中紫色）
            '#4ADE80',  // 物元25 - 特征 (耧架的特征) - 绿色系（浅绿色）
            '#F87171',  // 物元25 - 量值 (耧架的量值) - 红色系（浅红色）
            '#8B5CF6',  // 物元26 - 对象 (耧斗) - 蓝色系（紫色）
            '#4ADE80',  // 物元26 - 特征 (耧斗的特征) - 绿色系（浅绿色）
            '#F87171',  // 物元26 - 量值 (耧斗的量值) - 红色系（浅红色）
            '#EC4899',  // 物元27 - 对象 (耧腿) - 蓝色系（粉色）
            '#4ADE80',  // 物元27 - 特征 (耧腿的特征) - 绿色系（浅绿色）
            '#F87171',  // 物元27 - 量值 (耧腿的量值) - 红色系（浅红色）
            '#F43F5E',  // 物元28 - 对象 (耧辕) - 蓝色系（红色）
            '#4ADE80',  // 物元28 - 特征 (耧辕的特征) - 绿色系（浅绿色）
            '#F87171',  // 物元28 - 量值 (耧辕的量值) - 红色系（浅红色）
            '#06B6D4',  // 物元29 - 对象 (扶手) - 蓝色系（青色）
            '#4ADE80',  // 物元29 - 特征 (扶手的特征) - 绿色系（浅绿色）
            '#F87171',  // 物元29 - 量值 (扶手的量值) - 红色系（浅红色）
            '#10B981',  // 物元30 - 对象 (劳木) - 蓝色系（绿色）
            '#4ADE80',  // 物元30 - 特征 (劳木的特征) - 绿色系（浅绿色）
            '#F87171',  // 物元30 - 量值 (劳木的量值) - 红色系（浅红色）
            '#8B4513',  // 物元31 - 对象 (稻麦藁包) - 棕色系（木色）
            '#D2B48C',  // 物元31 - 特征 (稻麦藁包的特征) - 棕色系（浅木色）
            '#F5DEB3',  // 物元31 - 量值 (稻麦藁包的量值) - 棕色系（浅棕色）
            '#654321',  // 物元32 - 对象 (捆扎绳) - 深棕色系
            '#A0522D',  // 物元32 - 特征 (捆扎绳的特征) - 红棕色系
            '#CD853F',  // 物元32 - 量值 (捆扎绳的量值) - 秘鲁棕色系
            '#8B4513',  // 物元33 - 对象 (秧马) - 棕色系（木色）
            '#D2B48C',  // 物元33 - 特征 (秧马的特征) - 棕色系（浅木色）
            '#F5DEB3',  // 物元33 - 量值 (秧马的量值) - 棕色系（浅棕色）
            '#654321',  // 物元34 - 对象 (船形滑板) - 深棕色系
            '#A0522D',  // 物元34 - 特征 (船形滑板的特征) - 红棕色系
            '#CD853F',  // 物元34 - 量值 (船形滑板的量值) - 秘鲁棕色系
            '#8B4513',  // 物元35 - 对象 (坐板) - 棕色系（木色）
            '#D2B48C',  // 物元35 - 特征 (坐板的特征) - 棕色系（浅木色）
            '#F5DEB3',  // 物元35 - 量值 (坐板的量值) - 棕色系（浅棕色）
            '#654321',  // 物元36 - 对象 (横梁) - 深棕色系
            '#A0522D',  // 物元36 - 特征 (横梁的特征) - 红棕色系
            '#CD853F'   // 物元36 - 量值 (横梁的量值) - 秘鲁棕色系
        ];

        // 颜色系统说明：
        // 对象列（蓝色系/紫色系）：
        // - 耒（lěi）：#89CFF0（浅蓝色）
        // - 耒头：#0096FF（中蓝色）
        // - 耒柄：#6495ED（亮蓝色）
        // - 耜（sì）：#7B68EE（紫色）
        // - 耜头：#9370DB（中紫色）
        // - 耜柄：#8A2BE2（蓝紫色）
        // - 踏肩/踏脚处：#483D8B（暗岩蓝）
        // - 犁（lí）：#1A5276（深海蓝）
        // - 犁铧：#3498DB（亮蓝色）
        // - 犁壁：#2980B9（蓝绿色）
        // - 犁辕：#8E44AD（紫色）
        // - 犁箭：#117A65（深绿色）
        // 所有对象列颜色均与底部标签颜色#1E88E5有明显区分

        // 特征列（绿色系）：
        // - 耒（lěi）的特征：#84C98B（浅绿色）
        // - 耒头的特征：#40BA8D（中绿色）
        // - 耒柄的特征：#26896D（深绿色）
        // - 耜（sì）的特征：#98FB98（淡绿色）
        // - 耜头的特征：#90EE90（中淡绿色）
        // - 耜柄的特征：#32CD32（酸橙绿）
        // - 踏肩/踏脚处的特征：#00CED1（暗青色）
        // - 犁（lí）的特征：#52C41A（深绿色）
        // - 犁铧的特征：#2ECC71（薄荷绿）
        // - 犁壁的特征：#27AE60（深绿色）
        // - 犁辕的特征：#16A085（青绿色）
        // - 犁箭的特征：#1ABC9C（绿松石色）
        // 所有特征列颜色均与底部标签颜色#43A047有明显区分

        // 量值列（红色系/橙色系）：
        // - 耒（lěi）的量值：#FF6A6A（浅红色）
        // - 耒头的量值：#EE6363（中红色）
        // - 耒柄的量值：#CD5555（深红色）
        // - 耜（sì）的量值：#FFA07A（淡珊瑚色）
        // - 耜头的量值：#FA8072（三文鱼色）
        // - 耜柄的量值：#DC143C（深红色）
        // - 踏肩/踏脚处的量值：#FF4500（橙红色）
        // - 犁（lí）的量值：#E74C3C（鲜红色）
        // - 犁铧的量值：#F39C12（橙色）
        // - 犁壁的量值：#E67E22（橙红色）
        // - 犁辕的量值：#D35400（深橙色）
        // - 犁箭的量值：#C0392B（深红色）
        // 所有量值列颜色均与底部标签颜色#E53935有明显区分

        // 音效系统
        this.sounds = {
            move: this.createSound(440, 0.1),
            drop: this.createSound(659.25, 0.1),
            clear: this.createSound([880, 987.77, 1174.66], 0.3),
            gameOver: this.createSound([220, 196, 174.61], 0.5),
            correct: this.createSound([880, 1318.51], 0.2),
            wrong: this.createSound([110, 138.59], 0.2),
            celebration: this.createSound([523.25, 659.25, 783.99, 1046.50], 0.5),
            level1Celebration: this.createSound([523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98], 2.0) // 胜利音效（使用更完整的C大调上行音阶，延长持续时间）
        };

        // 音频上下文和音效冷却时间
        this.audioContext = null;
        this.soundCooldowns = {};
        this.soundCooldownTime = 100; // 毫秒

        // 第一关卡"耒（lěi）"数据结构
        this.level1Data = {
            // 三元组关系定义（原始数据）
            originalTriples: [
                { object: '耒（lěi）', feature: '萌芽期', value: '新石器时代早期' },
                { object: '耒（lěi）', feature: '衰退期', value: '商周以后' },
                { object: '耒（lěi）', feature: '材质', value: '木/骨/石（早期）、青铜/铁质（后期）' },
                { object: '耒（lěi）', feature: '适用土壤', value: '松软土壤' },
                { object: '耒（lěi）', feature: '效率', value: '较低' },
                { object: '耒头', feature: '材质', value: '木/骨/石（早期）、青铜/铁质（后期）' },
                { object: '耒头', feature: '形状', value: '锥形、扁平板状' },
                { object: '耒头', feature: '功能', value: '初步松动土层' },
                { object: '耒柄', feature: '材质', value: '木质' },
                { object: '耒柄', feature: '长度', value: '约等于人身高' },
                { object: '耒柄', feature: '形状', value: '长直杆且上端有自然弯曲' }
            ],
            // 用于存储实际使用的三元组（可能被打乱顺序）
            triples: [],
            // 当前进度索引
            currentIndex: 0,
            // 完成状态跟踪
            completed: [],
            // 三列的位置定义（每列4个格子）
            columns: {
                object: 0,    // 对象列：0-3列
                feature: 4,   // 特征列：4-7列
                value: 8      // 量值列：8-11列
            },
            // 随机掉落顺序存储
            dropOrders: [],
            // 三元组的随机顺序索引
            tripleOrder: [],
            // 初始化随机掉落顺序和三元组顺序
            initDropOrders() {
                // 重置三元组数组，使用原始数据
                this.triples = JSON.parse(JSON.stringify(this.originalTriples));

                // 打乱三元组的顺序
                this.tripleOrder = [];
                for (let i = 0; i < this.triples.length; i++) {
                    this.tripleOrder.push(i);
                }

                // Fisher-Yates 洗牌算法打乱三元组顺序
                for (let i = this.tripleOrder.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.tripleOrder[i], this.tripleOrder[j]] = [this.tripleOrder[j], this.tripleOrder[i]];
                }

                // 为每个三元组生成随机掉落顺序
                this.dropOrders = [];
                for (let i = 0; i < this.triples.length; i++) {
                    // 为每个三元组生成随机掉落顺序 [object, feature, value] 的随机排列
                    const order = ['object', 'feature', 'value'];
                    // Fisher-Yates 洗牌算法
                    for (let j = order.length - 1; j > 0; j--) {
                        const k = Math.floor(Math.random() * (j + 1));
                        [order[j], order[k]] = [order[k], order[j]];
                    }
                    this.dropOrders.push(order);
                }
            }
        };

        // 第二关卡"耜（sì）"数据结构
        this.level2Data = {
            // 三元组关系定义（原始数据）
            originalTriples: [
                { object: '耜（sì）', feature: '萌芽期', value: '新石器时代中晚期' },
                { object: '耜（sì）', feature: '衰退期', value: '商周以后' },
                { object: '耜（sì）', feature: '材质', value: '石/骨/木(新石器时代)、青铜(商周)、铁质(春秋后)' },
                { object: '耜（sì）', feature: '核心功能', value: '铲土、翻土' },
                { object: '耜（sì）', feature: '操作方式', value: '手持并用脚踏与肩部发力' },
                { object: '耜（sì）', feature: '效率', value: '高于耒' },
                { object: '耜头', feature: '材质', value: '石/骨/木（早期）、青铜/铁质（后期）' },
                { object: '耜头', feature: '形状', value: '扁平板状刃部且有肩或穿孔' },
                { object: '耜头', feature: '功能', value: '切入土壤、抬起土块翻土' },
                { object: '耜头', feature: '面积', value: '较大' },
                { object: '耜柄', feature: '材质', value: '木质' },
                { object: '耜柄', feature: '形状', value: '直杆' },
                { object: '耜柄', feature: '长度', value: '长于人身高' },
                { object: '耜柄', feature: '功能', value: '传递人力、形成杠杆、提供握持点' },
                { object: '踏肩/踏脚处', feature: '功能', value: '提供稳固的脚踏点' },
                { object: '踏肩/踏脚处', feature: '位置', value: '位于耜身下部，靠近耜头连接处' }
            ],
            // 用于存储实际使用的三元组（可能被打乱顺序）
            triples: [],
            // 当前进度索引
            currentIndex: 0,
            // 完成状态跟踪
            completed: [],
            // 三列的位置定义（每列4个格子）
            columns: {
                object: 0,    // 对象列：0-3列
                feature: 4,   // 特征列：4-7列
                value: 8      // 量值列：8-11列
            },
            // 随机掉落顺序存储
            dropOrders: [],
            // 三元组的随机顺序索引
            tripleOrder: [],
            // 初始化随机掉落顺序和三元组顺序
            initDropOrders() {
                // 重置三元组数组，使用原始数据
                this.triples = JSON.parse(JSON.stringify(this.originalTriples));

                // 打乱三元组的顺序
                this.tripleOrder = [];
                for (let i = 0; i < this.triples.length; i++) {
                    this.tripleOrder.push(i);
                }

                // Fisher-Yates 洗牌算法打乱三元组顺序
                for (let i = this.tripleOrder.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.tripleOrder[i], this.tripleOrder[j]] = [this.tripleOrder[j], this.tripleOrder[i]];
                }

                // 为每个三元组生成随机掉落顺序
                this.dropOrders = [];
                for (let i = 0; i < this.triples.length; i++) {
                    // 为每个三元组生成随机掉落顺序 [object, feature, value] 的随机排列
                    const order = ['object', 'feature', 'value'];
                    // Fisher-Yates 洗牌算法
                    for (let j = order.length - 1; j > 0; j--) {
                        const k = Math.floor(Math.random() * (j + 1));
                        [order[j], order[k]] = [order[k], order[j]];
                    }
                    this.dropOrders.push(order);
                }
            }
        };

        // 第三关卡"犁（lí）"数据结构
        this.level3Data = {
            // 三元组关系定义（原始数据）
            originalTriples: [
                { object: '犁（lí）', feature: '萌芽期', value: '商周时期' },
                { object: '犁（lí）', feature: '衰退期', value: '20世纪中后期' },
                { object: '犁（lí）', feature: '材质', value: '铁质、木质' },
                { object: '犁（lí）', feature: '核心动力', value: '人力、畜力' },
                { object: '犁（lí）', feature: '用途', value: '翻耕土地' },
                { object: '犁（lí）', feature: '效率', value: '极高' },
                { object: '犁铧', feature: '材质', value: '铁质' },
                { object: '犁铧', feature: '外形特点', value: '等边或等腰三角形且中空呈"V"形' },
                { object: '犁铧', feature: '核心功能', value: '切开土块并引导土垡上升' },
                { object: '犁壁', feature: '材质', value: '铁质' },
                { object: '犁壁', feature: '核心功能', value: '翻转和破碎土垡' },
                { object: '犁辕', feature: '材质', value: '木质' },
                { object: '犁辕', feature: '形状', value: '长杆（早期为直辕，唐代后普及曲辕）' },
                { object: '犁辕', feature: '长度', value: '远长于耒耜之柄' },
                { object: '犁辕', feature: '核心功能', value: '传递牵引力' },
                { object: '犁箭', feature: '核心功能', value: '调节耕深' }
            ],
            // 用于存储实际使用的三元组（可能被打乱顺序）
            triples: [],
            // 当前进度索引
            currentIndex: 0,
            // 完成状态跟踪
            completed: [],
            // 三列的位置定义（每列4个格子）
            columns: {
                object: 0,    // 对象列：0-3列
                feature: 4,   // 特征列：4-7列
                value: 8      // 量值列：8-11列
            },
            // 随机掉落顺序存储
            dropOrders: [],
            // 三元组的随机顺序索引
            tripleOrder: [],
            // 初始化随机掉落顺序和三元组顺序
            initDropOrders() {
                // 重置三元组数组，使用原始数据
                this.triples = JSON.parse(JSON.stringify(this.originalTriples));

                // 打乱三元组的顺序
                this.tripleOrder = [];
                for (let i = 0; i < this.triples.length; i++) {
                    this.tripleOrder.push(i);
                }

                // Fisher-Yates 洗牌算法打乱三元组顺序
                for (let i = this.tripleOrder.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.tripleOrder[i], this.tripleOrder[j]] = [this.tripleOrder[j], this.tripleOrder[i]];
                }

                // 为每个三元组生成随机掉落顺序
                this.dropOrders = [];
                for (let i = 0; i < this.triples.length; i++) {
                    // 为每个三元组生成随机掉落顺序 [object, feature, value] 的随机排列
                    const order = ['object', 'feature', 'value'];
                    // Fisher-Yates 洗牌算法
                    for (let j = order.length - 1; j > 0; j--) {
                        const k = Math.floor(Math.random() * (j + 1));
                        [order[j], order[k]] = [order[k], order[j]];
                    }
                    this.dropOrders.push(order);
                }
            }
        };

        // 第四关卡"耕牛（gēng niú）"数据结构
        this.level4Data = {
            // 三元组关系定义（原始数据）
            originalTriples: [
                { object: '耕牛（gēng niú）', feature: '体型', value: '大' },
                { object: '耕牛（gēng niú）', feature: '体重', value: '[300-800]kg' },
                { object: '耕牛（gēng niú）', feature: '寿命', value: '较长（约15-20年）' },
                { object: '耕牛（gēng niú）', feature: '品种', value: '黄牛、水牛、牦牛…' },
                { object: '耕牛（gēng niú）', feature: '食性', value: '草料、谷物…' },
                { object: '耕牛（gēng niú）', feature: '生理特性', value: '反刍动物、可驯化、驾驭、繁殖…' },
                { object: '耕牛（gēng niú）', feature: '性格特征', value: '性情相对温顺' },
                { object: '耕牛（gēng niú）', feature: '核心功能', value: '提供持续且强大的牵引力' },
                { object: '耕牛（gēng niú）', feature: '牵引力', value: '约等于其体重的10％-15％' },
                { object: '耕牛（gēng niú）', feature: '状态要求', value: '健康、驯服' },
                { object: '耕牛（gēng niú）', feature: '系统贡献', value: '成倍提升耕作效率与规模（日耕3-5亩）' },
                { object: '耕牛（gēng niú）', feature: '经济价值', value: '高' },
                { object: '躯干', feature: '生理特征', value: '强壮的肌肉、厚重的骨骼' },
                { object: '躯干', feature: '功能', value: '将生物能转化为机械牵引力' },
                { object: '蹄足', feature: '生理特征', value: '蹄壳坚硬、四肢稳健' },
                { object: '蹄足', feature: '功能', value: '提供抓地力和推进力' }
            ],
            // 用于存储实际使用的三元组（可能被打乱顺序）
            triples: [],
            // 当前进度索引
            currentIndex: 0,
            // 完成状态跟踪
            completed: [],
            // 三列的位置定义（每列4个格子）
            columns: {
                object: 0,    // 对象列：0-3列
                feature: 4,   // 特征列：4-7列
                value: 8      // 量值列：8-11列
            },
            // 随机掉落顺序存储
            dropOrders: [],
            // 三元组的随机顺序索引
            tripleOrder: [],
            // 初始化随机掉落顺序和三元组顺序
            initDropOrders() {
                // 重置三元组数组，使用原始数据
                this.triples = JSON.parse(JSON.stringify(this.originalTriples));

                // 打乱三元组的顺序
                this.tripleOrder = [];
                for (let i = 0; i < this.triples.length; i++) {
                    this.tripleOrder.push(i);
                }

                // Fisher-Yates 洗牌算法打乱三元组顺序
                for (let i = this.tripleOrder.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.tripleOrder[i], this.tripleOrder[j]] = [this.tripleOrder[j], this.tripleOrder[i]];
                }

                // 为每个三元组生成随机掉落顺序
                this.dropOrders = [];
                for (let i = 0; i < this.triples.length; i++) {
                    // 为每个三元组生成随机掉落顺序 [object, feature, value] 的随机排列
                    const order = ['object', 'feature', 'value'];
                    // Fisher-Yates 洗牌算法
                    for (let j = order.length - 1; j > 0; j--) {
                        const k = Math.floor(Math.random() * (j + 1));
                        [order[j], order[k]] = [order[k], order[j]];
                    }
                    this.dropOrders.push(order);
                }
            }
        };

        // 第五关卡"耖（chào）"数据结构
        this.level5Data = {
            // 三元组关系定义（原始数据）
            originalTriples: [
                { object: '耖（chào）', feature: '萌芽期', value: '唐代或更早（随江东曲辕犁体系出现）' },
                { object: '耖（chào）', feature: '普及应用期', value: '宋元以后' },
                { object: '耖（chào）', feature: '核心应用期', value: '明清' },
                { object: '耖（chào）', feature: '动力源', value: '畜力' },
                { object: '耖（chào）', feature: '材质', value: '竹质（早期）、铁（后期）' },
                { object: '耖（chào）', feature: '核心结构', value: '方形或"而"字形木架、下装一系列直列齿' },
                { object: '耖（chào）', feature: '核心功能', value: '碎土平田、搅匀泥水' },
                { object: '耖（chào）', feature: '使用场景', value: '水田（犁耕后，插秧前）' },
                { object: '耖（chào）', feature: '操作方式', value: '牛力牵引与人力控制' },
                { object: '耖齿', feature: '材质', value: '木、竹、铁' },
                { object: '耖齿', feature: '形状', value: '长直齿且下端尖锐' },
                { object: '耖齿', feature: '排列方式', value: '等距平行排列' },
                { object: '耖框', feature: '材质', value: '木质' },
                { object: '耖框', feature: '形状', value: '方形或"而"字形框架' },
                { object: '耖框', feature: '结构特性', value: '坚固且有一定宽度' },
                { object: '耖辕/牵引杆', feature: '结构', value: '两根平行的长辕' },
                { object: '耖辕/牵引杆', feature: '核心功能', value: '传递牵引力并作为扶手的支撑' }
            ],
            // 用于存储实际使用的三元组（可能被打乱顺序）
            triples: [],
            // 当前进度索引
            currentIndex: 0,
            // 完成状态跟踪
            completed: [],
            // 三列的位置定义（每列4个格子）
            columns: {
                object: 0,    // 对象列：0-3列
                feature: 4,   // 特征列：4-7列
                value: 8      // 量值列：8-11列
            },
            // 随机掉落顺序存储
            dropOrders: [],
            // 三元组的随机顺序索引
            tripleOrder: [],
            // 初始化随机掉落顺序和三元组顺序
            initDropOrders() {
                // 重置三元组数组，使用原始数据
                this.triples = JSON.parse(JSON.stringify(this.originalTriples));

                // 打乱三元组的顺序
                this.tripleOrder = [];
                for (let i = 0; i < this.triples.length; i++) {
                    this.tripleOrder.push(i);
                }

                // Fisher-Yates 洗牌算法打乱三元组顺序
                for (let i = this.tripleOrder.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.tripleOrder[i], this.tripleOrder[j]] = [this.tripleOrder[j], this.tripleOrder[i]];
                }

                // 为每个三元组生成随机掉落顺序
                this.dropOrders = [];
                for (let i = 0; i < this.triples.length; i++) {
                    // 为每个三元组生成随机掉落顺序 [object, feature, value] 的随机排列
                    const order = ['object', 'feature', 'value'];
                    // Fisher-Yates 洗牌算法
                    for (let j = order.length - 1; j > 0; j--) {
                        const k = Math.floor(Math.random() * (j + 1));
                        [order[j], order[k]] = [order[k], order[j]];
                    }
                    this.dropOrders.push(order);
                }
            }
        };

        // 第六关卡"磨耙（mó bà）"数据结构
        this.level6Data = {
            // 三元组关系定义（原始数据）
            originalTriples: [
                { object: '磨耙（mó bà）', feature: '萌芽期', value: '汉代' },
                { object: '磨耙（mó bà）', feature: '动力源', value: '畜力' },
                { object: '磨耙（mó bà）', feature: '材质', value: '铁质、木质' },
                { object: '磨耙（mó bà）', feature: '核心结构', value: '长条形平板或粗木段（无齿）' },
                { object: '磨耙（mó bà）', feature: '核心功能', value: '破碎土块、平田面、压实秧床、清除杂草、拌匀泥水' },
                { object: '磨耙（mó bà）', feature: '效率', value: '低于耖且适用于小地块' }
            ],
            // 用于存储实际使用的三元组（可能被打乱顺序）
            triples: [],
            // 当前进度索引
            currentIndex: 0,
            // 完成状态跟踪
            completed: [],
            // 三列的位置定义（每列4个格子）
            columns: {
                object: 0,    // 对象列：0-3列
                feature: 4,   // 特征列：4-7列
                value: 8      // 量值列：8-11列
            },
            // 随机掉落顺序存储
            dropOrders: [],
            // 三元组的随机顺序索引
            tripleOrder: [],
            // 初始化随机掉落顺序和三元组顺序
            initDropOrders() {
                // 重置三元组数组，使用原始数据
                this.triples = JSON.parse(JSON.stringify(this.originalTriples));

                // 打乱三元组的顺序
                this.tripleOrder = [];
                for (let i = 0; i < this.triples.length; i++) {
                    this.tripleOrder.push(i);
                }

                // Fisher-Yates 洗牌算法打乱三元组顺序
                for (let i = this.tripleOrder.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.tripleOrder[i], this.tripleOrder[j]] = [this.tripleOrder[j], this.tripleOrder[i]];
                }

                // 为每个三元组生成随机掉落顺序
                this.dropOrders = [];
                for (let i = 0; i < this.triples.length; i++) {
                    // 为每个三元组生成随机掉落顺序 [object, feature, value] 的随机排列
                    const order = ['object', 'feature', 'value'];
                    // Fisher-Yates 洗牌算法
                    for (let j = order.length - 1; j > 0; j--) {
                        const k = Math.floor(Math.random() * (j + 1));
                        [order[j], order[k]] = [order[k], order[j]];
                    }
                    this.dropOrders.push(order);
                }
            }
        };

        // 第七关卡"秧弹（yāng dàn）"数据结构
        this.level7Data = {
            // 三元组关系定义（原始数据）
            originalTriples: [
                { object: '秧弹（yāng dàn）', feature: '所属时代', value: '元代至今' },
                { object: '秧弹（yāng dàn）', feature: '类别', value: '水稻插秧辅助农具' },
                { object: '秧弹（yāng dàn）', feature: '用途', value: '规范插秧行距与株距' },
                { object: '秧弹（yāng dàn）', feature: '核心原理', value: '线性参照系' },
                { object: '秧弹（yāng dàn）', feature: '材质', value: '{植物纤维(篾、麻、棕)， 木质、竹质}' },
                { object: '秧弹（yāng dàn）', feature: '动力', value: '人力' },
                { object: '秧弹（yāng dàn）', feature: '效率', value: '比目测手插的直线度与均齐度效率更高' },
                { object: '绳索主体', feature: '外形特点', value: '细长条状' },
                { object: '绳索主体', feature: '作用', value: '拉直后为插秧提供参照直线' },
                { object: '绳索主体', feature: '材质', value: '篾缆、麻绳、棕绳' },
                { object: '固定件', feature: '外形特点', value: '细长柱状' },
                { object: '固定件', feature: '作用', value: '固定于田埂上' },
                { object: '固定件', feature: '材质', value: '木质、竹质' }
            ],
            // 用于存储实际使用的三元组（可能被打乱顺序）
            triples: [],
            // 当前进度索引
            currentIndex: 0,
            // 完成状态跟踪
            completed: [],
            // 三列的位置定义（每列4个格子）
            columns: {
                object: 0,    // 对象列：0-3列
                feature: 4,   // 特征列：4-7列
                value: 8      // 量值列：8-11列
            },
            // 随机掉落顺序存储
            dropOrders: [],
            // 三元组的随机顺序索引
            tripleOrder: [],
            // 初始化随机掉落顺序和三元组顺序
            initDropOrders() {
                // 重置三元组数组，使用原始数据
                this.triples = JSON.parse(JSON.stringify(this.originalTriples));

                // 打乱三元组的顺序
                this.tripleOrder = [];
                for (let i = 0; i < this.triples.length; i++) {
                    this.tripleOrder.push(i);
                }

                // Fisher-Yates 洗牌算法打乱三元组顺序
                for (let i = this.tripleOrder.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.tripleOrder[i], this.tripleOrder[j]] = [this.tripleOrder[j], this.tripleOrder[i]];
                }

                // 为每个三元组生成随机掉落顺序
                this.dropOrders = [];
                for (let i = 0; i < this.triples.length; i++) {
                    // 为每个三元组生成随机掉落顺序 [object, feature, value] 的随机排列
                    const order = ['object', 'feature', 'value'];
                    // Fisher-Yates 洗牌算法
                    for (let j = order.length - 1; j > 0; j--) {
                        const k = Math.floor(Math.random() * (j + 1));
                        [order[j], order[k]] = [order[k], order[j]];
                    }
                    this.dropOrders.push(order);
                }
            }
        };

        // 第八关卡"耧车（lóu chē）"数据结构
        this.level8Data = {
            // 三元组关系定义（原始数据）
            originalTriples: [
                { object: '耧车（lóu chē）', feature: '萌芽期', value: '西汉时期' },
                { object: '耧车（lóu chē）', feature: '类别', value: '精密播种农具' },
                { object: '耧车（lóu chē）', feature: '材质', value: '{木 (主体)，铁 (开沟/传动部件)}' },
                { object: '耧车（lóu chē）', feature: '作用', value: '{高效完成开沟、播种、覆土联合作业}' },
                { object: '耧车（lóu chē）', feature: '效率', value: '比人工撒播高10倍以上' },
                { object: '耧车（lóu chē）', feature: '核心原理', value: '种子重力流播与机械开沟同步' },
                { object: '耧车（lóu chē）', feature: '动力', value: '{人力，畜力}' },
                { object: '耧架', feature: '材质', value: '木质' },
                { object: '耧架', feature: '形状', value: '整体呈框架状' },
                { object: '耧斗', feature: '形状', value: '上宽下窄的倒金字塔形或箱形容器' },
                { object: '耧腿', feature: '数量', value: '1至5条不等' },
                { object: '耧辕', feature: '形状', value: '长杆状' },
                { object: '耧辕', feature: '作用', value: '连接牛轭传递牵引力' },
                { object: '扶手', feature: '形状', value: '横直杆' },
                { object: '扶手', feature: '作用', value: '控制行进方向与入土深度' },
                { object: '劳木', feature: '形状', value: '弧形木架' },
                { object: '劳木', feature: '作用', value: '掩种覆土' }
            ],
            // 用于存储实际使用的三元组（可能被打乱顺序）
            triples: [],
            // 当前进度索引
            currentIndex: 0,
            // 完成状态跟踪
            completed: [],
            // 三列的位置定义（每列4个格子）
            columns: {
                object: 0,    // 对象列：0-3列
                feature: 4,   // 特征列：4-7列
                value: 8      // 量值列：8-11列
            },
            // 随机掉落顺序存储
            dropOrders: [],
            // 三元组的随机顺序索引
            tripleOrder: [],
            // 初始化随机掉落顺序和三元组顺序
            initDropOrders() {
                // 重置三元组数组，使用原始数据
                this.triples = JSON.parse(JSON.stringify(this.originalTriples));

                // 打乱三元组的顺序
                this.tripleOrder = [];
                for (let i = 0; i < this.triples.length; i++) {
                    this.tripleOrder.push(i);
                }

                // Fisher-Yates 洗牌算法打乱三元组顺序
                for (let i = this.tripleOrder.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.tripleOrder[i], this.tripleOrder[j]] = [this.tripleOrder[j], this.tripleOrder[i]];
                }

                // 为每个三元组生成随机掉落顺序
                this.dropOrders = [];
                for (let i = 0; i < this.triples.length; i++) {
                    // 为每个三元组生成随机掉落顺序 [object, feature, value] 的随机排列
                    const order = ['object', 'feature', 'value'];
                    // Fisher-Yates 洗牌算法
                    for (let j = order.length - 1; j > 0; j--) {
                        const k = Math.floor(Math.random() * (j + 1));
                        [order[j], order[k]] = [order[k], order[j]];
                    }
                    this.dropOrders.push(order);
                }
            }
        };

        // 第九关卡"稻麦藁包（dào mài gǎo bāo）"数据结构
        this.level9Data = {
            // 三元组关系定义（原始数据）
            originalTriples: [
                { object: '稻麦藁包(dào mài gǎo bāo)', feature: '萌芽期', value: '古代农耕社会' },
                { object: '稻麦藁包(dào mài gǎo bāo)', feature: '衰退期', value: '20世纪中后期工业化包装材料普及' },
                { object: '稻麦藁包(dào mài gǎo bāo)', feature: '类别', value: '农业生产生活用草编器具' },
                { object: '稻麦藁包(dào mài gǎo bāo)', feature: '材质', value: '稻秆、麦秆等植物纤维' },
                { object: '稻麦藁包(dào mài gǎo bāo)', feature: '外形特点', value: '网状编织袋状' },
                { object: '捆扎绳', feature: '形状', value: '细长绳状' },
                { object: '捆扎绳', feature: '材质', value: '稻秆编织而成' }
            ],
            // 用于存储实际使用的三元组（可能被打乱顺序）
            triples: [],
            // 当前进度索引
            currentIndex: 0,
            // 完成状态跟踪
            completed: [],
            // 三列的位置定义（每列4个格子）
            columns: {
                object: 0,    // 对象列：0-3列
                feature: 4,   // 特征列：4-7列
                value: 8      // 量值列：8-11列
            },
            // 随机掉落顺序存储
            dropOrders: [],
            // 三元组的随机顺序索引
            tripleOrder: [],
            // 初始化随机掉落顺序和三元组顺序
            initDropOrders() {
                // 重置三元组数组，使用原始数据
                this.triples = JSON.parse(JSON.stringify(this.originalTriples));

                // 打乱三元组的顺序
                this.tripleOrder = [];
                for (let i = 0; i < this.triples.length; i++) {
                    this.tripleOrder.push(i);
                }

                // Fisher-Yates 洗牌算法打乱三元组顺序
                for (let i = this.tripleOrder.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.tripleOrder[i], this.tripleOrder[j]] = [this.tripleOrder[j], this.tripleOrder[i]];
                }

                // 为每个三元组生成随机掉落顺序
                this.dropOrders = [];
                for (let i = 0; i < this.triples.length; i++) {
                    // 为每个三元组生成随机掉落顺序 [object, feature, value] 的随机排列
                    const order = ['object', 'feature', 'value'];
                    // Fisher-Yates 洗牌算法
                    for (let j = order.length - 1; j > 0; j--) {
                        const k = Math.floor(Math.random() * (j + 1));
                        [order[j], order[k]] = [order[k], order[j]];
                    }
                    this.dropOrders.push(order);
                }
            }
        };

        // 第十关卡"秧马（yāng mǎ）"数据结构
        this.level10Data = {
            // 三元组关系定义（原始数据）
            originalTriples: [
                { object: '秧马(yāng mǎ)', feature: '所属时代', value: '北宋时期' },
                { object: '秧马(yāng mǎ)', feature: '材质', value: '木质为主' },
                { object: '秧马(yāng mǎ)', feature: '类别', value: '水稻种植农具' },
                { object: '秧马(yāng mǎ)', feature: '作用', value: '大幅降低疲劳度并延长有效作业时间' },
                { object: '秧马(yāng mǎ)', feature: '动力', value: '人力' },
                { object: '船形滑板', feature: '外形特点', value: '前翘后平且底面光滑' },
                { object: '坐板', feature: '外形特点', value: '长且扁的平板或凹面' },
                { object: '坐板', feature: '材质', value: '木质' },
                { object: '横梁', feature: '作用', value: '稳固整体结构' }
            ],
            // 用于存储实际使用的三元组（可能被打乱顺序）
            triples: [],
            // 当前进度索引
            currentIndex: 0,
            // 完成状态跟踪
            completed: [],
            // 三列的位置定义（每列4个格子）
            columns: {
                object: 0,    // 对象列：0-3列
                feature: 4,   // 特征列：4-7列
                value: 8      // 量值列：8-11列
            },
            // 随机掉落顺序存储
            dropOrders: [],
            // 三元组的随机顺序索引
            tripleOrder: [],
            // 初始化随机掉落顺序和三元组顺序
            initDropOrders() {
                // 重置三元组数组，使用原始数据
                this.triples = JSON.parse(JSON.stringify(this.originalTriples));

                // 打乱三元组的顺序
                this.tripleOrder = [];
                for (let i = 0; i < this.triples.length; i++) {
                    this.tripleOrder.push(i);
                }

                // Fisher-Yates 洗牌算法打乱三元组顺序
                for (let i = this.tripleOrder.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.tripleOrder[i], this.tripleOrder[j]] = [this.tripleOrder[j], this.tripleOrder[i]];
                }

                // 为每个三元组生成随机掉落顺序
                this.dropOrders = [];
                for (let i = 0; i < this.triples.length; i++) {
                    // 为每个三元组生成随机掉落顺序 [object, feature, value] 的随机排列
                    const order = ['object', 'feature', 'value'];
                    // Fisher-Yates 洗牌算法
                    for (let j = order.length - 1; j > 0; j--) {
                        const k = Math.floor(Math.random() * (j + 1));
                        [order[j], order[k]] = [order[k], order[j]];
                    }
                    this.dropOrders.push(order);
                }
            }
        };

        // 错误处理相关
        this.errorModule = null;
        this.errorPosition = null;
        this.errorConfirmed = false; // 记录用户是否已确认错误提示
        this.lastErrorPiece = null; // 记录上一个错误放置的方块信息
        this.correctingError = false; // 标记是否正在纠正错误放置

        // 统一关卡管理（索引从 1 开始，0 作为占位）
        this.levels = [
            null,
            this.level1Data,
            this.level2Data,
            this.level3Data,
            this.level4Data,
            this.level5Data,
            this.level6Data,
            this.level7Data,
            this.level8Data,
            this.level9Data,
            this.level10Data
        ];

        this.init();
    }

    // 创建游戏板
    createBoard() {
        return Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }

    // 获取当前关卡配置
    getCurrentLevelConfig() {
        if (!this.levels) {
            return null;
        }
        return this.levels[this.level] || null;
    }

    // 初始化所有关卡的数据与随机掉落顺序
    initAllLevels() {
        if (!this.levels) {
            return;
        }

        for (let i = 1; i < this.levels.length; i++) {
            const levelConfig = this.levels[i];
            if (!levelConfig) continue;

            // 重置进度
            levelConfig.currentIndex = 0;
            levelConfig.completed = [];

            // 初始化随机掉落顺序
            if (typeof levelConfig.initDropOrders === 'function') {
                levelConfig.initDropOrders();
            }
        }
    }

    // 重置所有关卡（用于“重新开始游戏”场景）
    resetAllLevels() {
        if (!this.levels) {
            return;
        }

        for (let i = 1; i < this.levels.length; i++) {
            const levelConfig = this.levels[i];
            if (!levelConfig) continue;

            levelConfig.currentIndex = 0;
            levelConfig.completed = [];

            if (typeof levelConfig.initDropOrders === 'function') {
                levelConfig.initDropOrders();
            }
        }

        // 重置已完成关卡列表
        this.completedLevels = [];
        // 更新关卡选择界面
        this.updateLevelSelectUI();
    }

    // 初始化游戏
    init() {
        // 将游戏对象暴露到全局，避免game is not defined错误
        window.game = this;
        
        // 更新关卡选择界面
        this.updateLevelSelectUI();

        // 从localStorage加载最高分
        const savedHighScore = localStorage.getItem('tetrisHighScore');
        if (savedHighScore) {
            this.highScore = parseInt(savedHighScore, 10);
            document.getElementById('highScore').textContent = this.highScore;
        }

        // 使用统一方法初始化所有关卡
        this.initAllLevels();

        // 初始化随机掉落顺序
        this.level1Data.initDropOrders();
        this.level2Data.initDropOrders();
        this.level3Data.initDropOrders();
        this.level4Data.initDropOrders();
        this.level5Data.initDropOrders();
        this.level6Data.initDropOrders();
        this.level7Data.initDropOrders();
        this.level8Data.initDropOrders();
        this.level9Data.initDropOrders();
        this.level10Data.initDropOrders();

        // 设置事件监听器
        this.setupEventListeners();

        // 初始化下一个方块显示
        this.spawnNewPiece();

        // 绘制游戏板（不显示底部标签和当前方块）
        this.draw();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => {
            this.playSound('correct');
            this.start();
        });
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.playSound('move');
            this.pause();
        });
        document.getElementById('levelSelectBtn').addEventListener('click', () => {
            this.playSound('correct');
            this.levelSelect();
        });
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.playSound('correct');
            this.reset();
        });

        // 游戏控制按钮

        document.getElementById('leftBtn').addEventListener('click', () => {
            this.move(-1, 0);
            this.playSound('move');
        });

        document.getElementById('downBtn').addEventListener('click', () => {
            this.move(0, 1);
            this.playSound('move');
        });

        document.getElementById('rightBtn').addEventListener('click', () => {
            this.move(1, 0);
            this.playSound('move');
        });

        document.getElementById('dropBtn').addEventListener('click', () => {
            this.hardDrop();
            this.playSound('drop');
        });

        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;

            switch (e.key) {
                case 'ArrowLeft':
                    this.move(-1, 0);
                    this.playSound('move');
                    break;
                case 'ArrowRight':
                    this.move(1, 0);
                    this.playSound('move');
                    break;
                case 'ArrowDown':
                    this.move(0, 1);
                    this.playSound('move');
                    break;

                case ' ':
                    this.hardDrop();
                    this.playSound('drop');
                    break;
            }
        });

        // 触摸支持（可选扩展）
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchend', (e) => {
            if (!this.gameRunning || this.gamePaused) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // 检测滑动方向
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
                if (deltaX > 0) {
                    this.move(1, 0);
                    this.playSound('move');
                } else {
                    this.move(-1, 0);
                    this.playSound('move');
                }
            } else if (Math.abs(deltaY) > 20 && deltaY > 0) {
                this.move(0, 1);
                this.playSound('move');
            }
        });


    }

    // 生成新方块
    spawnNewPiece() {
        // 如果是第一关卡，使用随机掉落顺序机制
        if (this.level === 1) {
            const levelData = this.level1Data;

            // 检查是否所有三元组都已完成
            if (levelData.currentIndex >= levelData.triples.length) {
                // 所有模块都已放置完成，触发第一关通关庆祝机制
                this.level1Win();
                return;
            }

            // 获取当前进度的三元组（使用打乱后的顺序）
            const currentTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex]];

            // 确定当前应该掉落的模块类型（按随机顺序）
            let currentModule = null;
            let moduleType = null;
            let color = null;

            // 检查当前三元组的完成状态
            let completedTriple = levelData.completed.find(t => t.index === levelData.currentIndex);

            // 根据物元类型确定颜色索引
            let elementIndex = 0;

            // 确定当前物元类型
            if (currentTriple.object === '耒（lěi）') {
                elementIndex = 1; // 物元1: 耒
            } else if (currentTriple.object === '耒头') {
                elementIndex = 2; // 物元2: 耒头
            } else if (currentTriple.object === '耒柄') {
                elementIndex = 3; // 物元3: 耒柄
            }

            // 如果是新的三元组，初始化完成状态
            if (!completedTriple) {
                // 初始化完成状态
                completedTriple = {
                    index: levelData.currentIndex,
                    tripleIndex: levelData.tripleOrder[levelData.currentIndex], // 记录原始三元组索引
                    object: false,
                    feature: false,
                    value: false
                };
                levelData.completed.push(completedTriple);
            }

            // 获取当前三元组的随机掉落顺序（使用打乱后的三元组顺序）
            const dropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];

            // 查找下一个要掉落的模块类型
            let foundNextModule = false;
            for (let i = 0; i < dropOrder.length; i++) {
                const type = dropOrder[i];
                if (!completedTriple[type]) {
                    moduleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (moduleType === 'object') {
                        currentModule = currentTriple.object;
                        color = this.colors[elementIndex * 3 + 1];
                    } else if (moduleType === 'feature') {
                        currentModule = currentTriple.feature;
                        color = this.colors[elementIndex * 3 + 2];
                    } else if (moduleType === 'value') {
                        currentModule = currentTriple.value;
                        color = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextModule = true;
                    break;
                }
            }

            // 如果没有找到下一个模块（所有都已完成），移动到下一个三元组
            if (!foundNextModule) {
                levelData.currentIndex++;
                return this.spawnNewPiece();
            }

            // 创建当前方块
            let colorIndex = 1; // 默认颜色索引
            if (moduleType === 'object') {
                colorIndex = elementIndex * 3 + 1; // 对象颜色索引
            } else if (moduleType === 'feature') {
                colorIndex = elementIndex * 3 + 2; // 特征颜色索引
            } else if (moduleType === 'value') {
                colorIndex = elementIndex * 3 + 3; // 量值颜色索引
            }

            this.currentPiece = {
                shape: this.shapes['I'], // 始终使用1x4的条形方块
                shapeKey: 'I',
                shapeIndex: 0,
                color: color,
                colorIndex: colorIndex, // 添加颜色索引，确保固定后颜色一致
                text: currentModule, // 添加文本内容
                moduleType: moduleType, // 添加模块类型
                tripleIndex: levelData.currentIndex, // 添加当前进度索引
                originalTripleIndex: levelData.tripleOrder[levelData.currentIndex], // 添加原始三元组索引
                x: Math.floor((this.cols - this.shapes['I'][0].length) / 2),
                y: 0 // 从顶部开始，确保不会超出上边界
            };

            // 生成下一个方块预览
            let nextModule = null;
            let nextModuleType = null;
            let nextColor = null;
            let nextElementIndex = elementIndex;

            // 查找当前三元组中的下一个模块
            const currentDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];
            let foundNextPreview = false;

            for (let i = 0; i < currentDropOrder.length; i++) {
                const type = currentDropOrder[i];
                if (!completedTriple[type]) {
                    // 跳过当前正在掉落的模块
                    if (type === moduleType) continue;

                    nextModuleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = currentTriple.object;
                        nextColor = this.colors[elementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextModule = currentTriple.feature;
                        nextColor = this.colors[elementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextModule = currentTriple.value;
                        nextColor = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextPreview = true;
                    break;
                }
            }

            // 如果当前三元组没有下一个模块，获取下一个三元组的第一个模块
            if (!foundNextPreview) {
                if (levelData.currentIndex + 1 < levelData.triples.length) {
                    const nextTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex + 1]];
                    const nextDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex + 1]];

                    // 获取下一个三元组的第一个要掉落的模块
                    nextModuleType = nextDropOrder[0];

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = nextTriple.object;
                    } else if (nextModuleType === 'feature') {
                        nextModule = nextTriple.feature;
                    } else if (nextModuleType === 'value') {
                        nextModule = nextTriple.value;
                    }

                    // 确定下一个物元类型
                    if (nextTriple.object === '耒（lěi）') {
                        nextElementIndex = 1;
                    } else if (nextTriple.object === '耒头') {
                        nextElementIndex = 2;
                    } else if (nextTriple.object === '耒柄') {
                        nextElementIndex = 3;
                    }

                    // 设置对应的颜色
                    if (nextModuleType === 'object') {
                        nextColor = this.colors[nextElementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextColor = this.colors[nextElementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextColor = this.colors[nextElementIndex * 3 + 3];
                    }
                } else {
                    // 没有下一个方块了
                    nextModule = '';
                    nextModuleType = '';
                    nextColor = this.colors[1];
                }
            }

            // 创建下一个方块预览
            this.nextPiece = {
                shape: this.shapes['I'],
                shapeKey: 'I',
                shapeIndex: 0,
                color: nextColor,
                text: nextModule,
                moduleType: nextModuleType
            };
        }
        // 如果是第二关卡，使用随机掉落顺序机制
        else if (this.level === 2) {
            const levelData = this.level2Data;

            // 检查是否所有三元组都已完成
            if (levelData.currentIndex >= levelData.triples.length) {
                // 所有模块都已放置完成，触发统一的通关庆祝机制
                this.level1Win();
                return;
            }

            // 获取当前进度的三元组（使用打乱后的顺序）
            const currentTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex]];

            // 确定当前应该掉落的模块类型（按随机顺序）
            let currentModule = null;
            let moduleType = null;
            let color = null;

            // 检查当前三元组的完成状态
            let completedTriple = levelData.completed.find(t => t.index === levelData.currentIndex);

            // 根据物元类型确定颜色索引
            let elementIndex = 0;

            // 确定当前物元类型
            if (currentTriple.object === '耜（sì）') {
                elementIndex = 4; // 物元4: 耜
            } else if (currentTriple.object === '耜头') {
                elementIndex = 5; // 物元5: 耜头
            } else if (currentTriple.object === '耜柄') {
                elementIndex = 6; // 物元6: 耜柄
            } else if (currentTriple.object === '踏肩/踏脚处') {
                elementIndex = 7; // 物元7: 踏肩/踏脚处
            } else if (currentTriple.object === '耒') {
                elementIndex = 1; // 物元1: 耒（复用第一关的颜色）
            }

            // 如果是新的三元组，初始化完成状态
            if (!completedTriple) {
                // 初始化完成状态
                completedTriple = {
                    index: levelData.currentIndex,
                    tripleIndex: levelData.tripleOrder[levelData.currentIndex], // 记录原始三元组索引
                    object: false,
                    feature: false,
                    value: false
                };
                levelData.completed.push(completedTriple);
            }

            // 获取当前三元组的随机掉落顺序（使用打乱后的三元组顺序）
            const dropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];

            // 查找下一个要掉落的模块类型
            let foundNextModule = false;
            for (let i = 0; i < dropOrder.length; i++) {
                const type = dropOrder[i];
                if (!completedTriple[type]) {
                    moduleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (moduleType === 'object') {
                        currentModule = currentTriple.object;
                        color = this.colors[elementIndex * 3 + 1];
                    } else if (moduleType === 'feature') {
                        currentModule = currentTriple.feature;
                        color = this.colors[elementIndex * 3 + 2];
                    } else if (moduleType === 'value') {
                        currentModule = currentTriple.value;
                        color = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextModule = true;
                    break;
                }
            }

            // 如果没有找到下一个模块（所有都已完成），移动到下一个三元组
            if (!foundNextModule) {
                levelData.currentIndex++;
                return this.spawnNewPiece();
            }

            // 创建当前方块
            let colorIndex = 1; // 默认颜色索引
            if (moduleType === 'object') {
                colorIndex = elementIndex * 3 + 1; // 对象颜色索引
            } else if (moduleType === 'feature') {
                colorIndex = elementIndex * 3 + 2; // 特征颜色索引
            } else if (moduleType === 'value') {
                colorIndex = elementIndex * 3 + 3; // 量值颜色索引
            }

            this.currentPiece = {
                shape: this.shapes['I'], // 始终使用1x4的条形方块
                shapeKey: 'I',
                shapeIndex: 0,
                color: color,
                colorIndex: colorIndex, // 添加颜色索引，确保固定后颜色一致
                text: currentModule, // 添加文本内容
                moduleType: moduleType, // 添加模块类型
                tripleIndex: levelData.currentIndex, // 添加当前进度索引
                originalTripleIndex: levelData.tripleOrder[levelData.currentIndex], // 添加原始三元组索引
                x: Math.floor((this.cols - this.shapes['I'][0].length) / 2),
                y: 0 // 从顶部开始，确保不会超出上边界
            };

            // 生成下一个方块预览
            let nextModule = null;
            let nextModuleType = null;
            let nextColor = null;
            let nextElementIndex = elementIndex;

            // 查找当前三元组中的下一个模块
            const currentDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];
            let foundNextPreview = false;

            for (let i = 0; i < currentDropOrder.length; i++) {
                const type = currentDropOrder[i];
                if (!completedTriple[type]) {
                    // 跳过当前正在掉落的模块
                    if (type === moduleType) continue;

                    nextModuleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = currentTriple.object;
                        nextColor = this.colors[elementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextModule = currentTriple.feature;
                        nextColor = this.colors[elementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextModule = currentTriple.value;
                        nextColor = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextPreview = true;
                    break;
                }
            }

            // 如果当前三元组没有下一个模块，获取下一个三元组的第一个模块
            if (!foundNextPreview) {
                if (levelData.currentIndex + 1 < levelData.triples.length) {
                    const nextTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex + 1]];
                    const nextDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex + 1]];

                    // 获取下一个三元组的第一个要掉落的模块
                    nextModuleType = nextDropOrder[0];

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = nextTriple.object;
                    } else if (nextModuleType === 'feature') {
                        nextModule = nextTriple.feature;
                    } else if (nextModuleType === 'value') {
                        nextModule = nextTriple.value;
                    }

                    // 确定下一个物元类型
                    if (nextTriple.object === '耜（sì）') {
                        nextElementIndex = 4; // 物元4: 耜
                    } else if (nextTriple.object === '耜头') {
                        nextElementIndex = 5; // 物元5: 耜头
                    } else if (nextTriple.object === '耜柄') {
                        nextElementIndex = 6; // 物元6: 耜柄
                    } else if (nextTriple.object === '踏肩/踏脚处') {
                        nextElementIndex = 7; // 物元7: 踏肩/踏脚处
                    } else if (nextTriple.object === '耒') {
                        nextElementIndex = 1; // 物元1: 耒（复用第一关的颜色）
                    }

                    // 设置对应的颜色
                    if (nextModuleType === 'object') {
                        nextColor = this.colors[nextElementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextColor = this.colors[nextElementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextColor = this.colors[nextElementIndex * 3 + 3];
                    }
                } else {
                    // 没有下一个方块了
                    nextModule = '';
                    nextModuleType = '';
                    nextColor = this.colors[1];
                }
            }

            // 创建下一个方块预览
            this.nextPiece = {
                shape: this.shapes['I'],
                shapeKey: 'I',
                shapeIndex: 0,
                color: nextColor,
                text: nextModule,
                moduleType: nextModuleType
            };
        }
        // 如果是第三关卡，使用随机掉落顺序机制
        else if (this.level === 3) {
            const levelData = this.level3Data;

            // 检查是否所有三元组都已完成
            if (levelData.currentIndex >= levelData.triples.length) {
                // 所有模块都已放置完成，触发统一的通关庆祝机制
                this.level1Win();
                return;
            }

            // 获取当前进度的三元组（使用打乱后的顺序）
            const currentTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex]];

            // 确定当前应该掉落的模块类型（按随机顺序）
            let currentModule = null;
            let moduleType = null;
            let color = null;

            // 检查当前三元组的完成状态
            let completedTriple = levelData.completed.find(t => t.index === levelData.currentIndex);

            // 根据物元类型确定颜色索引
            let elementIndex = 0;

            // 确定当前物元类型
            if (currentTriple.object === '犁（lí）') {
                elementIndex = 8; // 物元8: 犁
            } else if (currentTriple.object === '犁铧') {
                elementIndex = 9; // 物元9: 犁铧
            } else if (currentTriple.object === '犁壁') {
                elementIndex = 10; // 物元10: 犁壁
            } else if (currentTriple.object === '犁辕') {
                elementIndex = 11; // 物元11: 犁辕
            } else if (currentTriple.object === '犁箭') {
                elementIndex = 12; // 物元12: 犁箭
            }

            // 如果是新的三元组，初始化完成状态
            if (!completedTriple) {
                // 初始化完成状态
                completedTriple = {
                    index: levelData.currentIndex,
                    tripleIndex: levelData.tripleOrder[levelData.currentIndex], // 记录原始三元组索引
                    object: false,
                    feature: false,
                    value: false
                };
                levelData.completed.push(completedTriple);
            }

            // 获取当前三元组的随机掉落顺序（使用打乱后的三元组顺序）
            const dropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];

            // 查找下一个要掉落的模块类型
            let foundNextModule = false;
            for (let i = 0; i < dropOrder.length; i++) {
                const type = dropOrder[i];
                if (!completedTriple[type]) {
                    moduleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (moduleType === 'object') {
                        currentModule = currentTriple.object;
                        color = this.colors[elementIndex * 3 + 1];
                    } else if (moduleType === 'feature') {
                        currentModule = currentTriple.feature;
                        color = this.colors[elementIndex * 3 + 2];
                    } else if (moduleType === 'value') {
                        currentModule = currentTriple.value;
                        color = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextModule = true;
                    break;
                }
            }

            // 如果没有找到下一个模块（所有都已完成），移动到下一个三元组
            if (!foundNextModule) {
                levelData.currentIndex++;
                return this.spawnNewPiece();
            }

            // 创建当前方块
            let colorIndex = 1; // 默认颜色索引
            if (moduleType === 'object') {
                colorIndex = elementIndex * 3 + 1; // 对象颜色索引
            } else if (moduleType === 'feature') {
                colorIndex = elementIndex * 3 + 2; // 特征颜色索引
            } else if (moduleType === 'value') {
                colorIndex = elementIndex * 3 + 3; // 量值颜色索引
            }

            this.currentPiece = {
                shape: this.shapes['I'], // 始终使用1x4的条形方块
                shapeKey: 'I',
                shapeIndex: 0,
                color: color,
                colorIndex: colorIndex, // 添加颜色索引，确保固定后颜色一致
                text: currentModule, // 添加文本内容
                moduleType: moduleType, // 添加模块类型
                tripleIndex: levelData.currentIndex, // 添加当前进度索引
                originalTripleIndex: levelData.tripleOrder[levelData.currentIndex], // 添加原始三元组索引
                x: Math.floor((this.cols - this.shapes['I'][0].length) / 2),
                y: 0 // 从顶部开始，确保不会超出上边界
            };

            // 生成下一个方块预览
            let nextModule = null;
            let nextModuleType = null;
            let nextColor = null;
            let nextElementIndex = elementIndex;

            // 查找当前三元组中的下一个模块
            const currentDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];
            let foundNextPreview = false;

            for (let i = 0; i < currentDropOrder.length; i++) {
                const type = currentDropOrder[i];
                if (!completedTriple[type]) {
                    // 跳过当前正在掉落的模块
                    if (type === moduleType) continue;

                    nextModuleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = currentTriple.object;
                        nextColor = this.colors[elementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextModule = currentTriple.feature;
                        nextColor = this.colors[elementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextModule = currentTriple.value;
                        nextColor = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextPreview = true;
                    break;
                }
            }

            // 如果当前三元组没有下一个模块，获取下一个三元组的第一个模块
            if (!foundNextPreview) {
                if (levelData.currentIndex + 1 < levelData.triples.length) {
                    const nextTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex + 1]];
                    const nextDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex + 1]];

                    // 获取下一个三元组的第一个要掉落的模块
                    nextModuleType = nextDropOrder[0];

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = nextTriple.object;
                    } else if (nextModuleType === 'feature') {
                        nextModule = nextTriple.feature;
                    } else if (nextModuleType === 'value') {
                        nextModule = nextTriple.value;
                    }

                    // 确定下一个物元类型
                    if (nextTriple.object === '犁（lí）') {
                        nextElementIndex = 8; // 物元8: 犁
                    } else if (nextTriple.object === '犁铧') {
                        nextElementIndex = 9; // 物元9: 犁铧
                    } else if (nextTriple.object === '犁壁') {
                        nextElementIndex = 10; // 物元10: 犁壁
                    } else if (nextTriple.object === '犁辕') {
                        nextElementIndex = 11; // 物元11: 犁辕
                    } else if (nextTriple.object === '犁箭') {
                        nextElementIndex = 12; // 物元12: 犁箭
                    }

                    // 设置对应的颜色
                    if (nextModuleType === 'object') {
                        nextColor = this.colors[nextElementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextColor = this.colors[nextElementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextColor = this.colors[nextElementIndex * 3 + 3];
                    }
                } else {
                    // 没有下一个方块了
                    nextModule = '';
                    nextModuleType = '';
                    nextColor = this.colors[1];
                }
            }

            // 创建下一个方块预览
            this.nextPiece = {
                shape: this.shapes['I'],
                shapeKey: 'I',
                shapeIndex: 0,
                color: nextColor,
                text: nextModule,
                moduleType: nextModuleType
            };
        }
        // 如果是第四关卡，使用随机掉落顺序机制
        else if (this.level === 4) {
            const levelData = this.level4Data;

            // 检查是否所有三元组都已完成
            if (levelData.currentIndex >= levelData.triples.length) {
                // 所有模块都已放置完成，触发统一的通关庆祝机制
                this.level1Win();
                return;
            }

            // 获取当前进度的三元组（使用打乱后的顺序）
            const currentTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex]];

            // 确定当前应该掉落的模块类型（按随机顺序）
            let currentModule = null;
            let moduleType = null;
            let color = null;

            // 检查当前三元组的完成状态
            let completedTriple = levelData.completed.find(t => t.index === levelData.currentIndex);

            // 根据物元类型确定颜色索引
            let elementIndex = 0;

            // 确定当前物元类型
            if (currentTriple.object === '耕牛（gēng niú）') {
                elementIndex = 13; // 物元13: 耕牛
            } else if (currentTriple.object === '躯干') {
                elementIndex = 14; // 物元14: 躯干
            } else if (currentTriple.object === '蹄足') {
                elementIndex = 15; // 物元15: 蹄足
            }

            // 如果是新的三元组，初始化完成状态
            if (!completedTriple) {
                // 初始化完成状态
                completedTriple = {
                    index: levelData.currentIndex,
                    tripleIndex: levelData.tripleOrder[levelData.currentIndex], // 记录原始三元组索引
                    object: false,
                    feature: false,
                    value: false
                };
                levelData.completed.push(completedTriple);
            }

            // 获取当前三元组的随机掉落顺序（使用打乱后的三元组顺序）
            const dropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];

            // 查找下一个要掉落的模块类型
            let foundNextModule = false;
            for (let i = 0; i < dropOrder.length; i++) {
                const type = dropOrder[i];
                if (!completedTriple[type]) {
                    moduleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (moduleType === 'object') {
                        currentModule = currentTriple.object;
                        color = this.colors[elementIndex * 3 + 1];
                    } else if (moduleType === 'feature') {
                        currentModule = currentTriple.feature;
                        color = this.colors[elementIndex * 3 + 2];
                    } else if (moduleType === 'value') {
                        currentModule = currentTriple.value;
                        color = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextModule = true;
                    break;
                }
            }

            // 如果没有找到下一个模块（所有都已完成），移动到下一个三元组
            if (!foundNextModule) {
                levelData.currentIndex++;
                return this.spawnNewPiece();
            }

            // 创建当前方块
            let colorIndex = 1; // 默认颜色索引
            if (moduleType === 'object') {
                colorIndex = elementIndex * 3 + 1; // 对象颜色索引
            } else if (moduleType === 'feature') {
                colorIndex = elementIndex * 3 + 2; // 特征颜色索引
            } else if (moduleType === 'value') {
                colorIndex = elementIndex * 3 + 3; // 量值颜色索引
            }

            this.currentPiece = {
                shape: this.shapes['I'], // 始终使用1x4的条形方块
                shapeKey: 'I',
                shapeIndex: 0,
                color: color,
                colorIndex: colorIndex, // 添加颜色索引，确保固定后颜色一致
                text: currentModule, // 添加文本内容
                moduleType: moduleType, // 添加模块类型
                tripleIndex: levelData.currentIndex, // 添加当前进度索引
                originalTripleIndex: levelData.tripleOrder[levelData.currentIndex], // 添加原始三元组索引
                x: Math.floor((this.cols - this.shapes['I'][0].length) / 2),
                y: 0 // 从顶部开始，确保不会超出上边界
            };

            // 生成下一个方块预览
            let nextModule = null;
            let nextModuleType = null;
            let nextColor = null;
            let nextElementIndex = elementIndex;

            // 查找当前三元组中的下一个模块
            const currentDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];
            let foundNextPreview = false;

            for (let i = 0; i < currentDropOrder.length; i++) {
                const type = currentDropOrder[i];
                if (!completedTriple[type]) {
                    // 跳过当前正在掉落的模块
                    if (type === moduleType) continue;

                    nextModuleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = currentTriple.object;
                        nextColor = this.colors[elementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextModule = currentTriple.feature;
                        nextColor = this.colors[elementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextModule = currentTriple.value;
                        nextColor = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextPreview = true;
                    break;
                }
            }

            // 如果当前三元组没有下一个模块，获取下一个三元组的第一个模块
            if (!foundNextPreview) {
                if (levelData.currentIndex + 1 < levelData.triples.length) {
                    const nextTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex + 1]];
                    const nextDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex + 1]];

                    // 获取下一个三元组的第一个要掉落的模块
                    nextModuleType = nextDropOrder[0];

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = nextTriple.object;
                    } else if (nextModuleType === 'feature') {
                        nextModule = nextTriple.feature;
                    } else if (nextModuleType === 'value') {
                        nextModule = nextTriple.value;
                    }

                    // 确定下一个物元类型
                    if (nextTriple.object === '耕牛（gēng niú）') {
                        nextElementIndex = 13; // 物元13: 耕牛
                    } else if (nextTriple.object === '躯干') {
                        nextElementIndex = 14; // 物元14: 躯干
                    } else if (nextTriple.object === '蹄足') {
                        nextElementIndex = 15; // 物元15: 蹄足
                    }

                    // 设置对应的颜色
                    if (nextModuleType === 'object') {
                        nextColor = this.colors[nextElementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextColor = this.colors[nextElementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextColor = this.colors[nextElementIndex * 3 + 3];
                    }
                } else {
                    // 没有下一个方块了
                    nextModule = '';
                    nextModuleType = '';
                    nextColor = this.colors[1];
                }
            }

            // 创建下一个方块预览
            this.nextPiece = {
                shape: this.shapes['I'],
                shapeKey: 'I',
                shapeIndex: 0,
                color: nextColor,
                text: nextModule,
                moduleType: nextModuleType
            };
        }
        // 如果是第五关卡，使用随机掉落顺序机制
        else if (this.level === 5) {
            const levelData = this.level5Data;

            // 检查是否所有三元组都已完成
            if (levelData.currentIndex >= levelData.triples.length) {
                // 所有模块都已放置完成，触发统一的通关庆祝机制
                this.level1Win();
                return;
            }

            // 获取当前进度的三元组（使用打乱后的顺序）
            const currentTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex]];

            // 确定当前应该掉落的模块类型（按随机顺序）
            let currentModule = null;
            let moduleType = null;
            let color = null;

            // 检查当前三元组的完成状态
            let completedTriple = levelData.completed.find(t => t.index === levelData.currentIndex);

            // 根据物元类型确定颜色索引
            let elementIndex = 0;

            // 确定当前物元类型
            if (currentTriple.object === '耖（chào）') {
                elementIndex = 16; // 物元16: 耖
            } else if (currentTriple.object === '耖齿') {
                elementIndex = 17; // 物元17: 耖齿
            } else if (currentTriple.object === '耖框') {
                elementIndex = 18; // 物元18: 耖框
            } else if (currentTriple.object === '耖辕/牵引杆') {
                elementIndex = 19; // 物元19: 耖辕/牵引杆
            }

            // 如果是新的三元组，初始化完成状态
            if (!completedTriple) {
                // 初始化完成状态
                completedTriple = {
                    index: levelData.currentIndex,
                    tripleIndex: levelData.tripleOrder[levelData.currentIndex], // 记录原始三元组索引
                    object: false,
                    feature: false,
                    value: false
                };
                levelData.completed.push(completedTriple);
            }

            // 获取当前三元组的随机掉落顺序（使用打乱后的三元组顺序）
            const dropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];

            // 查找下一个要掉落的模块类型
            let foundNextModule = false;
            for (let i = 0; i < dropOrder.length; i++) {
                const type = dropOrder[i];
                if (!completedTriple[type]) {
                    moduleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (moduleType === 'object') {
                        currentModule = currentTriple.object;
                        color = this.colors[elementIndex * 3 + 1];
                    } else if (moduleType === 'feature') {
                        currentModule = currentTriple.feature;
                        color = this.colors[elementIndex * 3 + 2];
                    } else if (moduleType === 'value') {
                        currentModule = currentTriple.value;
                        color = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextModule = true;
                    break;
                }
            }

            // 如果没有找到下一个模块（所有都已完成），移动到下一个三元组
            if (!foundNextModule) {
                levelData.currentIndex++;
                return this.spawnNewPiece();
            }

            // 创建当前方块
            let colorIndex = 1; // 默认颜色索引
            if (moduleType === 'object') {
                colorIndex = elementIndex * 3 + 1; // 对象颜色索引
            } else if (moduleType === 'feature') {
                colorIndex = elementIndex * 3 + 2; // 特征颜色索引
            } else if (moduleType === 'value') {
                colorIndex = elementIndex * 3 + 3; // 量值颜色索引
            }

            this.currentPiece = {
                shape: this.shapes['I'], // 始终使用1x4的条形方块
                shapeKey: 'I',
                shapeIndex: 0,
                color: color,
                colorIndex: colorIndex, // 添加颜色索引，确保固定后颜色一致
                text: currentModule, // 添加文本内容
                moduleType: moduleType, // 添加模块类型
                tripleIndex: levelData.currentIndex, // 添加当前进度索引
                originalTripleIndex: levelData.tripleOrder[levelData.currentIndex], // 添加原始三元组索引
                x: Math.floor((this.cols - this.shapes['I'][0].length) / 2),
                y: 0 // 从顶部开始，确保不会超出上边界
            };

            // 生成下一个方块预览
            let nextModule = null;
            let nextModuleType = null;
            let nextColor = null;
            let nextElementIndex = elementIndex;

            // 查找当前三元组中的下一个模块
            const currentDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];
            let foundNextPreview = false;

            for (let i = 0; i < currentDropOrder.length; i++) {
                const type = currentDropOrder[i];
                if (!completedTriple[type]) {
                    // 跳过当前正在掉落的模块
                    if (type === moduleType) continue;

                    nextModuleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = currentTriple.object;
                        nextColor = this.colors[elementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextModule = currentTriple.feature;
                        nextColor = this.colors[elementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextModule = currentTriple.value;
                        nextColor = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextPreview = true;
                    break;
                }
            }

            // 如果当前三元组没有下一个模块，获取下一个三元组的第一个模块
            if (!foundNextPreview) {
                if (levelData.currentIndex + 1 < levelData.triples.length) {
                    const nextTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex + 1]];
                    const nextDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex + 1]];

                    // 获取下一个三元组的第一个要掉落的模块
                    nextModuleType = nextDropOrder[0];

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = nextTriple.object;
                    } else if (nextModuleType === 'feature') {
                        nextModule = nextTriple.feature;
                    } else if (nextModuleType === 'value') {
                        nextModule = nextTriple.value;
                    }

                    // 确定下一个物元类型
                    if (nextTriple.object === '耖（chào）') {
                        nextElementIndex = 16; // 物元16: 耖
                    } else if (nextTriple.object === '耖齿') {
                        nextElementIndex = 17; // 物元17: 耖齿
                    } else if (nextTriple.object === '耖框') {
                        nextElementIndex = 18; // 物元18: 耖框
                    } else if (nextTriple.object === '耖辕/牵引杆') {
                        nextElementIndex = 19; // 物元19: 耖辕/牵引杆
                    }

                    // 设置对应的颜色
                    if (nextModuleType === 'object') {
                        nextColor = this.colors[nextElementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextColor = this.colors[nextElementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextColor = this.colors[nextElementIndex * 3 + 3];
                    }
                } else {
                    // 没有下一个方块了
                    nextModule = '';
                    nextModuleType = '';
                    nextColor = this.colors[1];
                }
            }

            // 创建下一个方块预览
            this.nextPiece = {
                shape: this.shapes['I'],
                shapeKey: 'I',
                shapeIndex: 0,
                color: nextColor,
                text: nextModule,
                moduleType: nextModuleType
            };
        }
        // 如果是第六关卡，使用随机掉落顺序机制
        else if (this.level === 6) {
            const levelData = this.level6Data;

            // 检查是否所有三元组都已完成
            if (levelData.currentIndex >= levelData.triples.length) {
                // 所有模块都已放置完成，触发统一的通关庆祝机制
                this.level1Win();
                return;
            }

            // 获取当前进度的三元组（使用打乱后的顺序）
            const currentTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex]];

            // 确定当前应该掉落的模块类型（按随机顺序）
            let currentModule = null;
            let moduleType = null;
            let color = null;

            // 检查当前三元组的完成状态
            let completedTriple = levelData.completed.find(t => t.index === levelData.currentIndex);

            // 根据物元类型确定颜色索引
            let elementIndex = 0;

            // 确定当前物元类型
            if (currentTriple.object === '磨耙（mó bà）') {
                elementIndex = 20; // 物元20: 磨耙
            }

            // 如果是新的三元组，初始化完成状态
            if (!completedTriple) {
                // 初始化完成状态
                completedTriple = {
                    index: levelData.currentIndex,
                    tripleIndex: levelData.tripleOrder[levelData.currentIndex], // 记录原始三元组索引
                    object: false,
                    feature: false,
                    value: false
                };
                levelData.completed.push(completedTriple);
            }

            // 获取当前三元组的随机掉落顺序（使用打乱后的三元组顺序）
            const dropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];

            // 查找下一个要掉落的模块类型
            let foundNextModule = false;
            for (let i = 0; i < dropOrder.length; i++) {
                const type = dropOrder[i];
                if (!completedTriple[type]) {
                    moduleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (moduleType === 'object') {
                        currentModule = currentTriple.object;
                        color = this.colors[elementIndex * 3 + 1];
                    } else if (moduleType === 'feature') {
                        currentModule = currentTriple.feature;
                        color = this.colors[elementIndex * 3 + 2];
                    } else if (moduleType === 'value') {
                        currentModule = currentTriple.value;
                        color = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextModule = true;
                    break;
                }
            }

            // 如果没有找到下一个模块（所有都已完成），移动到下一个三元组
            if (!foundNextModule) {
                levelData.currentIndex++;
                return this.spawnNewPiece();
            }

            // 创建当前方块
            let colorIndex = 1; // 默认颜色索引
            if (moduleType === 'object') {
                colorIndex = elementIndex * 3 + 1; // 对象颜色索引
            } else if (moduleType === 'feature') {
                colorIndex = elementIndex * 3 + 2; // 特征颜色索引
            } else if (moduleType === 'value') {
                colorIndex = elementIndex * 3 + 3; // 量值颜色索引
            }

            this.currentPiece = {
                shape: this.shapes['I'], // 始终使用1x4的条形方块
                shapeKey: 'I',
                shapeIndex: 0,
                color: color,
                colorIndex: colorIndex, // 添加颜色索引，确保固定后颜色一致
                text: currentModule, // 添加文本内容
                moduleType: moduleType, // 添加模块类型
                tripleIndex: levelData.currentIndex, // 添加当前进度索引
                originalTripleIndex: levelData.tripleOrder[levelData.currentIndex], // 添加原始三元组索引
                x: Math.floor((this.cols - this.shapes['I'][0].length) / 2),
                y: 0 // 从顶部开始，确保不会超出上边界
            };

            // 生成下一个方块预览
            let nextModule = null;
            let nextModuleType = null;
            let nextColor = null;
            let nextElementIndex = elementIndex;

            // 查找当前三元组中的下一个模块
            const currentDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];
            let foundNextPreview = false;

            for (let i = 0; i < currentDropOrder.length; i++) {
                const type = currentDropOrder[i];
                if (!completedTriple[type]) {
                    // 跳过当前正在掉落的模块
                    if (type === moduleType) continue;

                    nextModuleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = currentTriple.object;
                        nextColor = this.colors[elementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextModule = currentTriple.feature;
                        nextColor = this.colors[elementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextModule = currentTriple.value;
                        nextColor = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextPreview = true;
                    break;
                }
            }

            // 如果当前三元组没有下一个模块，获取下一个三元组的第一个模块
            if (!foundNextPreview) {
                if (levelData.currentIndex + 1 < levelData.triples.length) {
                    const nextTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex + 1]];
                    const nextDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex + 1]];

                    // 获取下一个三元组的第一个要掉落的模块
                    nextModuleType = nextDropOrder[0];

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = nextTriple.object;
                    } else if (nextModuleType === 'feature') {
                        nextModule = nextTriple.feature;
                    } else if (nextModuleType === 'value') {
                        nextModule = nextTriple.value;
                    }

                    // 确定下一个物元类型
                    if (nextTriple.object === '磨耙（mó bà）') {
                        nextElementIndex = 20; // 物元20: 磨耙
                    }

                    // 设置对应的颜色
                    if (nextModuleType === 'object') {
                        nextColor = this.colors[nextElementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextColor = this.colors[nextElementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextColor = this.colors[nextElementIndex * 3 + 3];
                    }
                } else {
                    // 没有下一个方块了
                    nextModule = '';
                    nextModuleType = '';
                    nextColor = this.colors[1];
                }
            }

            // 创建下一个方块预览
            this.nextPiece = {
                shape: this.shapes['I'],
                shapeKey: 'I',
                shapeIndex: 0,
                color: nextColor,
                text: nextModule,
                moduleType: nextModuleType
            };
        }
        // 如果是第七关卡，使用随机掉落顺序机制
        else if (this.level === 7) {
            const levelData = this.level7Data;

            // 检查是否所有三元组都已完成
            if (levelData.currentIndex >= levelData.triples.length) {
                // 所有模块都已放置完成，触发统一的通关庆祝机制
                this.level1Win();
                return;
            }

            // 获取当前进度的三元组（使用打乱后的顺序）
            const currentTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex]];

            // 确定当前应该掉落的模块类型（按随机顺序）
            let currentModule = null;
            let moduleType = null;
            let color = null;

            // 检查当前三元组的完成状态
            let completedTriple = levelData.completed.find(t => t.index === levelData.currentIndex);

            // 根据物元类型确定颜色索引
            let elementIndex = 0;

            // 确定当前物元类型
            if (currentTriple.object === '秧弹（yāng dàn）') {
                elementIndex = 21; // 物元21: 秧弹
            } else if (currentTriple.object === '绳索主体') {
                elementIndex = 22; // 物元22: 绳索主体
            } else if (currentTriple.object === '固定件') {
                elementIndex = 23; // 物元23: 固定件
            }

            // 如果是新的三元组，初始化完成状态
            if (!completedTriple) {
                // 初始化完成状态
                completedTriple = {
                    index: levelData.currentIndex,
                    tripleIndex: levelData.tripleOrder[levelData.currentIndex], // 记录原始三元组索引
                    object: false,
                    feature: false,
                    value: false
                };
                levelData.completed.push(completedTriple);
            }

            // 获取当前三元组的随机掉落顺序（使用打乱后的三元组顺序）
            const dropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];

            // 查找下一个要掉落的模块类型
            let foundNextModule = false;
            for (let i = 0; i < dropOrder.length; i++) {
                const type = dropOrder[i];
                if (!completedTriple[type]) {
                    moduleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (moduleType === 'object') {
                        currentModule = currentTriple.object;
                        color = this.colors[elementIndex * 3 + 1];
                    } else if (moduleType === 'feature') {
                        currentModule = currentTriple.feature;
                        color = this.colors[elementIndex * 3 + 2];
                    } else if (moduleType === 'value') {
                        currentModule = currentTriple.value;
                        color = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextModule = true;
                    break;
                }
            }

            // 如果没有找到下一个模块（所有都已完成），移动到下一个三元组
            if (!foundNextModule) {
                levelData.currentIndex++;
                return this.spawnNewPiece();
            }

            // 创建当前方块
            let colorIndex = 1; // 默认颜色索引
            if (moduleType === 'object') {
                colorIndex = elementIndex * 3 + 1; // 对象颜色索引
            } else if (moduleType === 'feature') {
                colorIndex = elementIndex * 3 + 2; // 特征颜色索引
            } else if (moduleType === 'value') {
                colorIndex = elementIndex * 3 + 3; // 量值颜色索引
            }

            this.currentPiece = {
                shape: this.shapes['I'], // 始终使用1x4的条形方块
                shapeKey: 'I',
                shapeIndex: 0,
                color: color,
                colorIndex: colorIndex, // 添加颜色索引，确保固定后颜色一致
                text: currentModule, // 添加文本内容
                moduleType: moduleType, // 添加模块类型
                tripleIndex: levelData.currentIndex, // 添加当前进度索引
                originalTripleIndex: levelData.tripleOrder[levelData.currentIndex], // 添加原始三元组索引
                x: Math.floor((this.cols - this.shapes['I'][0].length) / 2),
                y: 0 // 从顶部开始，确保不会超出上边界
            };

            // 生成下一个方块预览
            let nextModule = null;
            let nextModuleType = null;
            let nextColor = null;
            let nextElementIndex = elementIndex;

            // 查找当前三元组中的下一个模块
            const currentDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];
            let foundNextPreview = false;

            for (let i = 0; i < currentDropOrder.length; i++) {
                const type = currentDropOrder[i];
                if (!completedTriple[type]) {
                    // 跳过当前正在掉落的模块
                    if (type === moduleType) continue;

                    nextModuleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = currentTriple.object;
                        nextColor = this.colors[elementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextModule = currentTriple.feature;
                        nextColor = this.colors[elementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextModule = currentTriple.value;
                        nextColor = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextPreview = true;
                    break;
                }
            }

            // 如果当前三元组没有下一个模块，获取下一个三元组的第一个模块
            if (!foundNextPreview) {
                if (levelData.currentIndex + 1 < levelData.triples.length) {
                    const nextTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex + 1]];
                    const nextDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex + 1]];

                    // 获取下一个三元组的第一个要掉落的模块
                    nextModuleType = nextDropOrder[0];

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = nextTriple.object;
                    } else if (nextModuleType === 'feature') {
                        nextModule = nextTriple.feature;
                    } else if (nextModuleType === 'value') {
                        nextModule = nextTriple.value;
                    }

                    // 确定下一个物元类型
                    if (nextTriple.object === '秧弹（yāng dàn）') {
                        nextElementIndex = 21; // 物元21: 秧弹
                    } else if (nextTriple.object === '绳索主体') {
                        nextElementIndex = 22; // 物元22: 绳索主体
                    } else if (nextTriple.object === '固定件') {
                        nextElementIndex = 23; // 物元23: 固定件
                    }

                    // 设置对应的颜色
                    if (nextModuleType === 'object') {
                        nextColor = this.colors[nextElementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextColor = this.colors[nextElementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextColor = this.colors[nextElementIndex * 3 + 3];
                    }
                } else {
                    // 没有下一个方块了
                    nextModule = '';
                    nextModuleType = '';
                    nextColor = this.colors[1];
                }
            }

            // 创建下一个方块预览
            this.nextPiece = {
                shape: this.shapes['I'],
                shapeKey: 'I',
                shapeIndex: 0,
                color: nextColor,
                text: nextModule,
                moduleType: nextModuleType
            };
        }
        // 如果是第八关卡，使用随机掉落顺序机制
        else if (this.level === 8) {
            const levelData = this.level8Data;

            // 检查是否所有三元组都已完成
            if (levelData.currentIndex >= levelData.triples.length) {
                // 所有模块都已放置完成，触发统一的通关庆祝机制
                this.level1Win();
                return;
            }

            // 获取当前进度的三元组（使用打乱后的顺序）
            const currentTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex]];

            // 确定当前应该掉落的模块类型（按随机顺序）
            let currentModule = null;
            let moduleType = null;
            let color = null;

            // 检查当前三元组的完成状态
            let completedTriple = levelData.completed.find(t => t.index === levelData.currentIndex);

            // 根据物元类型确定颜色索引
            let elementIndex = 0;

            // 确定当前物元类型
            if (currentTriple.object === '耧车（lóu chē）') {
                elementIndex = 24; // 物元24: 耧车
            } else if (currentTriple.object === '耧架') {
                elementIndex = 25; // 物元25: 耧架
            } else if (currentTriple.object === '耧斗') {
                elementIndex = 26; // 物元26: 耧斗
            } else if (currentTriple.object === '耧腿') {
                elementIndex = 27; // 物元27: 耧腿
            } else if (currentTriple.object === '耧辕') {
                elementIndex = 28; // 物元28: 耧辕
            } else if (currentTriple.object === '扶手') {
                elementIndex = 29; // 物元29: 扶手
            } else if (currentTriple.object === '劳木') {
                elementIndex = 30; // 物元30: 劳木
            }

            // 如果是新的三元组，初始化完成状态
            if (!completedTriple) {
                // 初始化完成状态
                completedTriple = {
                    index: levelData.currentIndex,
                    tripleIndex: levelData.tripleOrder[levelData.currentIndex], // 记录原始三元组索引
                    object: false,
                    feature: false,
                    value: false
                };
                levelData.completed.push(completedTriple);
            }

            // 获取当前三元组的随机掉落顺序（使用打乱后的三元组顺序）
            const dropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];

            // 查找下一个要掉落的模块类型
            let foundNextModule = false;
            for (let i = 0; i < dropOrder.length; i++) {
                const type = dropOrder[i];
                if (!completedTriple[type]) {
                    moduleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (moduleType === 'object') {
                        currentModule = currentTriple.object;
                        color = this.colors[elementIndex * 3 + 1];
                    } else if (moduleType === 'feature') {
                        currentModule = currentTriple.feature;
                        color = this.colors[elementIndex * 3 + 2];
                    } else if (moduleType === 'value') {
                        currentModule = currentTriple.value;
                        color = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextModule = true;
                    break;
                }
            }

            // 如果没有找到下一个模块（所有都已完成），移动到下一个三元组
            if (!foundNextModule) {
                levelData.currentIndex++;
                return this.spawnNewPiece();
            }

            // 创建当前方块
            let colorIndex = 1; // 默认颜色索引
            if (moduleType === 'object') {
                colorIndex = elementIndex * 3 + 1; // 对象颜色索引
            } else if (moduleType === 'feature') {
                colorIndex = elementIndex * 3 + 2; // 特征颜色索引
            } else if (moduleType === 'value') {
                colorIndex = elementIndex * 3 + 3; // 量值颜色索引
            }

            this.currentPiece = {
                shape: this.shapes['I'], // 始终使用1x4的条形方块
                shapeKey: 'I',
                shapeIndex: 0,
                color: color,
                colorIndex: colorIndex, // 添加颜色索引，确保固定后颜色一致
                text: currentModule, // 添加文本内容
                moduleType: moduleType, // 添加模块类型
                tripleIndex: levelData.currentIndex, // 添加当前进度索引
                originalTripleIndex: levelData.tripleOrder[levelData.currentIndex], // 添加原始三元组索引
                x: Math.floor((this.cols - this.shapes['I'][0].length) / 2),
                y: 0 // 从顶部开始，确保不会超出上边界
            };

            // 生成下一个方块预览
            let nextModule = null;
            let nextModuleType = null;
            let nextColor = null;
            let nextElementIndex = elementIndex;

            // 查找当前三元组中的下一个模块
            const currentDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];
            let foundNextPreview = false;

            for (let i = 0; i < currentDropOrder.length; i++) {
                const type = currentDropOrder[i];
                if (!completedTriple[type]) {
                    // 跳过当前正在掉落的模块
                    if (type === moduleType) continue;

                    nextModuleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = currentTriple.object;
                        nextColor = this.colors[elementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextModule = currentTriple.feature;
                        nextColor = this.colors[elementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextModule = currentTriple.value;
                        nextColor = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextPreview = true;
                    break;
                }
            }

            // 如果当前三元组没有下一个模块，获取下一个三元组的第一个模块
            if (!foundNextPreview) {
                if (levelData.currentIndex + 1 < levelData.triples.length) {
                    const nextTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex + 1]];
                    const nextDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex + 1]];

                    // 获取下一个三元组的第一个要掉落的模块
                    nextModuleType = nextDropOrder[0];

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = nextTriple.object;
                    } else if (nextModuleType === 'feature') {
                        nextModule = nextTriple.feature;
                    } else if (nextModuleType === 'value') {
                        nextModule = nextTriple.value;
                    }

                    // 确定下一个物元类型
                    if (nextTriple.object === '耧车（lóu chē）') {
                        nextElementIndex = 24; // 物元24: 耧车
                    } else if (nextTriple.object === '耧架') {
                        nextElementIndex = 25; // 物元25: 耧架
                    } else if (nextTriple.object === '耧斗') {
                        nextElementIndex = 26; // 物元26: 耧斗
                    } else if (nextTriple.object === '耧腿') {
                        nextElementIndex = 27; // 物元27: 耧腿
                    } else if (nextTriple.object === '耧辕') {
                        nextElementIndex = 28; // 物元28: 耧辕
                    } else if (nextTriple.object === '扶手') {
                        nextElementIndex = 29; // 物元29: 扶手
                    } else if (nextTriple.object === '劳木') {
                        nextElementIndex = 30; // 物元30: 劳木
                    }

                    // 设置对应的颜色
                    if (nextModuleType === 'object') {
                        nextColor = this.colors[nextElementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextColor = this.colors[nextElementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextColor = this.colors[nextElementIndex * 3 + 3];
                    }
                } else {
                    // 没有下一个方块了
                    nextModule = '';
                    nextModuleType = '';
                    nextColor = this.colors[1];
                }
            }

            // 创建下一个方块预览
            this.nextPiece = {
                shape: this.shapes['I'],
                shapeKey: 'I',
                shapeIndex: 0,
                color: nextColor,
                text: nextModule,
                moduleType: nextModuleType
            };
        }
        // 如果是第九关卡，使用随机掉落顺序机制
        else if (this.level === 9) {
            const levelData = this.level9Data;

            // 检查是否所有三元组都已完成
            if (levelData.currentIndex >= levelData.triples.length) {
                // 所有模块都已放置完成，触发统一的通关庆祝机制
                this.level1Win();
                return;
            }

            // 获取当前进度的三元组（使用打乱后的顺序）
            const currentTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex]];

            // 确定当前应该掉落的模块类型（按随机顺序）
            let currentModule = null;
            let moduleType = null;
            let color = null;

            // 检查当前三元组的完成状态
            let completedTriple = levelData.completed.find(t => t.index === levelData.currentIndex);

            // 根据物元类型确定颜色索引
            let elementIndex = 0;

            // 确定当前物元类型
            if (currentTriple.object.includes('稻麦藁包')) {
                elementIndex = 31; // 物元31: 稻麦藁包
            } else if (currentTriple.object === '捆扎绳') {
                elementIndex = 32; // 物元32: 捆扎绳
            }

            // 如果是新的三元组，初始化完成状态
            if (!completedTriple) {
                // 初始化完成状态
                completedTriple = {
                    index: levelData.currentIndex,
                    tripleIndex: levelData.tripleOrder[levelData.currentIndex], // 记录原始三元组索引
                    object: false,
                    feature: false,
                    value: false
                };
                levelData.completed.push(completedTriple);
            }

            // 获取当前三元组的随机掉落顺序（使用打乱后的三元组顺序）
            const dropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];

            // 查找下一个要掉落的模块类型
            let foundNextModule = false;
            for (let i = 0; i < dropOrder.length; i++) {
                const type = dropOrder[i];
                if (!completedTriple[type]) {
                    moduleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (moduleType === 'object') {
                        currentModule = currentTriple.object;
                        color = this.colors[elementIndex * 3 + 1];
                    } else if (moduleType === 'feature') {
                        currentModule = currentTriple.feature;
                        color = this.colors[elementIndex * 3 + 2];
                    } else if (moduleType === 'value') {
                        currentModule = currentTriple.value;
                        color = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextModule = true;
                    break;
                }
            }

            // 如果没有找到下一个模块（所有都已完成），移动到下一个三元组
            if (!foundNextModule) {
                levelData.currentIndex++;
                return this.spawnNewPiece();
            }

            // 创建当前方块
            let colorIndex = 1; // 默认颜色索引
            if (moduleType === 'object') {
                colorIndex = elementIndex * 3 + 1; // 对象颜色索引
            } else if (moduleType === 'feature') {
                colorIndex = elementIndex * 3 + 2; // 特征颜色索引
            } else if (moduleType === 'value') {
                colorIndex = elementIndex * 3 + 3; // 量值颜色索引
            }

            this.currentPiece = {
                shape: this.shapes['I'], // 始终使用1x4的条形方块
                shapeKey: 'I',
                shapeIndex: 0,
                color: color,
                colorIndex: colorIndex, // 添加颜色索引，确保固定后颜色一致
                text: currentModule, // 添加文本内容
                moduleType: moduleType, // 添加模块类型
                tripleIndex: levelData.currentIndex, // 添加当前进度索引
                originalTripleIndex: levelData.tripleOrder[levelData.currentIndex], // 添加原始三元组索引
                x: Math.floor((this.cols - this.shapes['I'][0].length) / 2),
                y: 0 // 从顶部开始，确保不会超出上边界
            };

            // 生成下一个方块预览
            let nextModule = null;
            let nextModuleType = null;
            let nextColor = null;
            let nextElementIndex = elementIndex;

            // 查找当前三元组中的下一个模块
            const currentDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];
            let foundNextPreview = false;

            for (let i = 0; i < currentDropOrder.length; i++) {
                const type = currentDropOrder[i];
                if (!completedTriple[type]) {
                    // 跳过当前正在掉落的模块
                    if (type === moduleType) continue;

                    nextModuleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = currentTriple.object;
                        nextColor = this.colors[elementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextModule = currentTriple.feature;
                        nextColor = this.colors[elementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextModule = currentTriple.value;
                        nextColor = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextPreview = true;
                    break;
                }
            }

            // 如果当前三元组没有下一个模块，获取下一个三元组的第一个模块
            if (!foundNextPreview) {
                if (levelData.currentIndex + 1 < levelData.triples.length) {
                    const nextTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex + 1]];
                    const nextDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex + 1]];

                    // 获取下一个三元组的第一个要掉落的模块
                    nextModuleType = nextDropOrder[0];

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = nextTriple.object;
                    } else if (nextModuleType === 'feature') {
                        nextModule = nextTriple.feature;
                    } else if (nextModuleType === 'value') {
                        nextModule = nextTriple.value;
                    }

                    // 确定下一个物元类型
                    if (nextTriple.object.includes('稻麦藁包')) {
                        nextElementIndex = 31; // 物元31: 稻麦藁包
                    } else if (nextTriple.object === '捆扎绳') {
                        nextElementIndex = 32; // 物元32: 捆扎绳
                    }

                    // 设置对应的颜色
                    if (nextModuleType === 'object') {
                        nextColor = this.colors[nextElementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextColor = this.colors[nextElementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextColor = this.colors[nextElementIndex * 3 + 3];
                    }
                } else {
                    // 没有下一个方块了
                    nextModule = '';
                    nextModuleType = '';
                    nextColor = this.colors[1];
                }
            }

            // 创建下一个方块预览
            this.nextPiece = {
                shape: this.shapes['I'],
                shapeKey: 'I',
                shapeIndex: 0,
                color: nextColor,
                text: nextModule,
                moduleType: nextModuleType
            };
        }
        // 如果是第十关卡，使用随机掉落顺序机制
        else if (this.level === 10) {
            const levelData = this.level10Data;

            // 检查是否所有三元组都已完成
            if (levelData.currentIndex >= levelData.triples.length) {
                // 所有模块都已放置完成，触发统一的通关庆祝机制
                this.level1Win();
                return;
            }

            // 获取当前进度的三元组（使用打乱后的顺序）
            const currentTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex]];

            // 确定当前应该掉落的模块类型（按随机顺序）
            let currentModule = null;
            let moduleType = null;
            let color = null;

            // 检查当前三元组的完成状态
            let completedTriple = levelData.completed.find(t => t.index === levelData.currentIndex);

            // 根据物元类型确定颜色索引
            let elementIndex = 0;

            // 确定当前物元类型
            if (currentTriple.object.includes('秧马')) {
                elementIndex = 33; // 物元33: 秧马
            } else if (currentTriple.object === '船形滑板') {
                elementIndex = 34; // 物元34: 船形滑板
            } else if (currentTriple.object === '坐板') {
                elementIndex = 35; // 物元35: 坐板
            } else if (currentTriple.object === '横梁') {
                elementIndex = 36; // 物元36: 横梁
            }

            // 如果是新的三元组，初始化完成状态
            if (!completedTriple) {
                // 初始化完成状态
                completedTriple = {
                    index: levelData.currentIndex,
                    tripleIndex: levelData.tripleOrder[levelData.currentIndex], // 记录原始三元组索引
                    object: false,
                    feature: false,
                    value: false
                };
                levelData.completed.push(completedTriple);
            }

            // 获取当前三元组的随机掉落顺序（使用打乱后的三元组顺序）
            const dropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];

            // 查找下一个要掉落的模块类型
            let foundNextModule = false;
            for (let i = 0; i < dropOrder.length; i++) {
                const type = dropOrder[i];
                if (!completedTriple[type]) {
                    moduleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (moduleType === 'object') {
                        currentModule = currentTriple.object;
                        color = this.colors[elementIndex * 3 + 1];
                    } else if (moduleType === 'feature') {
                        currentModule = currentTriple.feature;
                        color = this.colors[elementIndex * 3 + 2];
                    } else if (moduleType === 'value') {
                        currentModule = currentTriple.value;
                        color = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextModule = true;
                    break;
                }
            }

            // 如果没有找到下一个模块（所有都已完成），移动到下一个三元组
            if (!foundNextModule) {
                levelData.currentIndex++;
                return this.spawnNewPiece();
            }

            // 创建当前方块
            let colorIndex = 1; // 默认颜色索引
            if (moduleType === 'object') {
                colorIndex = elementIndex * 3 + 1; // 对象颜色索引
            } else if (moduleType === 'feature') {
                colorIndex = elementIndex * 3 + 2; // 特征颜色索引
            } else if (moduleType === 'value') {
                colorIndex = elementIndex * 3 + 3; // 量值颜色索引
            }

            this.currentPiece = {
                shape: this.shapes['I'], // 始终使用1x4的条形方块
                shapeKey: 'I',
                shapeIndex: 0,
                color: color,
                colorIndex: colorIndex, // 添加颜色索引，确保固定后颜色一致
                text: currentModule, // 添加文本内容
                moduleType: moduleType, // 添加模块类型
                tripleIndex: levelData.currentIndex, // 添加当前进度索引
                originalTripleIndex: levelData.tripleOrder[levelData.currentIndex], // 添加原始三元组索引
                x: Math.floor((this.cols - this.shapes['I'][0].length) / 2),
                y: 0 // 从顶部开始，确保不会超出上边界
            };

            // 生成下一个方块预览
            let nextModule = null;
            let nextModuleType = null;
            let nextColor = null;
            let nextElementIndex = elementIndex;

            // 查找当前三元组中的下一个模块
            const currentDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex]];
            let foundNextPreview = false;

            for (let i = 0; i < currentDropOrder.length; i++) {
                const type = currentDropOrder[i];
                if (!completedTriple[type]) {
                    // 跳过当前正在掉落的模块
                    if (type === moduleType) continue;

                    nextModuleType = type;

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = currentTriple.object;
                        nextColor = this.colors[elementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextModule = currentTriple.feature;
                        nextColor = this.colors[elementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextModule = currentTriple.value;
                        nextColor = this.colors[elementIndex * 3 + 3];
                    }

                    foundNextPreview = true;
                    break;
                }
            }

            // 如果当前三元组没有下一个模块，获取下一个三元组的第一个模块
            if (!foundNextPreview) {
                if (levelData.currentIndex + 1 < levelData.triples.length) {
                    const nextTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex + 1]];
                    const nextDropOrder = levelData.dropOrders[levelData.tripleOrder[levelData.currentIndex + 1]];

                    // 获取下一个三元组的第一个要掉落的模块
                    nextModuleType = nextDropOrder[0];

                    // 根据模块类型获取对应的内容和颜色
                    if (nextModuleType === 'object') {
                        nextModule = nextTriple.object;
                    } else if (nextModuleType === 'feature') {
                        nextModule = nextTriple.feature;
                    } else if (nextModuleType === 'value') {
                        nextModule = nextTriple.value;
                    }

                    // 确定下一个物元类型
                    if (nextTriple.object.includes('秧马')) {
                        nextElementIndex = 33; // 物元33: 秧马
                    } else if (nextTriple.object === '船形滑板') {
                        nextElementIndex = 34; // 物元34: 船形滑板
                    } else if (nextTriple.object === '坐板') {
                        nextElementIndex = 35; // 物元35: 坐板
                    } else if (nextTriple.object === '横梁') {
                        nextElementIndex = 36; // 物元36: 横梁
                    }

                    // 设置对应的颜色
                    if (nextModuleType === 'object') {
                        nextColor = this.colors[nextElementIndex * 3 + 1];
                    } else if (nextModuleType === 'feature') {
                        nextColor = this.colors[nextElementIndex * 3 + 2];
                    } else if (nextModuleType === 'value') {
                        nextColor = this.colors[nextElementIndex * 3 + 3];
                    }
                } else {
                    // 没有下一个方块了
                    nextModule = '';
                    nextModuleType = '';
                    nextColor = this.colors[1];
                }
            }

            // 创建下一个方块预览
            this.nextPiece = {
                shape: this.shapes['I'],
                shapeKey: 'I',
                shapeIndex: 0,
                color: nextColor,
                text: nextModule,
                moduleType: nextModuleType
            };
        } else {
            // 其他关卡使用随机生成
            const shapeKeys = ['I', 'A', 'B'];
            const shapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
            const shapeIndex = shapeKeys.indexOf(shapeKey); // 0, 1, 2
            const shape = this.shapes[shapeKey];

            this.currentPiece = {
                shape: shape,
                shapeKey: shapeKey,
                shapeIndex: shapeIndex,
                color: this.colors[shapeIndex + 1], // +1 对应colors数组中的有效颜色索引(1, 2, 3)
                x: Math.floor((this.cols - shape[0].length) / 2),
                y: 0 // 从顶部开始，确保不会超出上边界
            };

            // 生成下一个方块
            const nextShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
            const nextShapeIndex = shapeKeys.indexOf(nextShapeKey);
            this.nextPiece = {
                shape: this.shapes[nextShapeKey],
                shapeKey: nextShapeKey,
                shapeIndex: nextShapeIndex,
                color: this.colors[nextShapeIndex + 1] // +1 对应colors数组中的有效颜色索引
            };
        }

        // 检查游戏是否结束
        if (this.checkCollision(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver();
        }
    }

    // 移动方块
    move(dx, dy) {
        if (!this.gameRunning || this.gamePaused) return;

        // 计算新位置
        const newX = this.currentPiece.x + dx;
        let newY = this.currentPiece.y + dy;

        // 确保方块不会移动到上边界以上
        if (newY < 0) {
            newY = 0;
        }

        if (!this.checkCollision(this.currentPiece.shape, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            this.draw();
        } else if (dy > 0) {
            // 方块不能继续下移，固定到游戏板上
            this.lockPiece();
            this.playSound('drop');
        }
    }

    // 旋转方块（对于1x4方块，旋转会变成4x1）
    rotatePiece() {
        if (!this.gameRunning || this.gamePaused) return;

        const rotatedMatrix = this.rotateMatrix(this.currentPiece.shape);

        // 检查旋转后是否会碰撞
        if (!this.checkCollision(rotatedMatrix, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = rotatedMatrix;
            this.draw();
        }
    }



    // 快速下降
    hardDrop() {
        if (!this.gameRunning || this.gamePaused) return;

        // 确保方块在下降前不会超出上边界
        if (this.currentPiece.y < 0) {
            this.currentPiece.y = 0;
        }

        while (!this.checkCollision(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
            this.currentPiece.y++;
        }
        this.lockPiece();
        this.playSound('drop');

        // 重置下落时间，确保下一个方块能够立即开始自动下降
        this.lastDropTime = 0;
    }



    // 检查碰撞
    checkCollision(shape, x, y) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const newX = x + c;
                    const newY = y + r;

                    // 检查左右边界
                    if (newX < 0 || newX >= this.cols) {
                        return true;
                    }

                    // 检查底部边界（考虑底部固定标签方块）
                    if (newY >= this.rows - (this.showLabels ? 1 : 0)) {
                        return true;
                    }

                    // 检查顶部边界 - 允许方块从顶部出现
                    if (newY < 0) {
                        continue;
                    }

                    // 检查与已固定方块的碰撞
                    if (newY >= 0 && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // 固定方块到游戏板上
    lockPiece() {
        // 第1-10关都使用相同的特殊锁定机制
        if (this.level >= 1 && this.level <= 10) {
            // 根据当前关卡获取对应的关卡数据
            let levelData;
            switch (this.level) {
                case 1: levelData = this.level1Data; break;
                case 2: levelData = this.level2Data; break;
                case 3: levelData = this.level3Data; break;
                case 4: levelData = this.level4Data; break;
                case 5: levelData = this.level5Data; break;
                case 6: levelData = this.level6Data; break;
                case 7: levelData = this.level7Data; break;
                case 8: levelData = this.level8Data; break;
                case 9: levelData = this.level9Data; break;
                case 10: levelData = this.level10Data; break;
                default: levelData = this.level1Data; break;
            }
            const currentPiece = this.currentPiece;
            const currentTriple = levelData.triples[levelData.tripleOrder[levelData.currentIndex]];

            // 获取方块的位置信息
            const startX = currentPiece.x;
            const endX = currentPiece.x + currentPiece.shape[0].length - 1;
            const y = currentPiece.y + currentPiece.shape.length - 1; // 方块底部的行

            // 检查方块是否放置在正确的列中
            let correctColumn = false;
            let columnType = currentPiece.moduleType;

            // 获取对应列的范围
            const columnStart = levelData.columns[columnType];
            const columnEnd = columnStart + 3; // 每列4个格子

            // 检查方块是否完全在对应列内
            if (startX >= columnStart && endX <= columnEnd) {
                correctColumn = true;
            }

            if (correctColumn) {
                // 检查是否是纠正错误放置的情况
                let isCorrectingError = false;
                if (this.errorConfirmed && this.lastErrorPiece) {
                    // 检查当前方块是否与上一个错误方块是同一个
                    if (currentPiece.text === this.lastErrorPiece.text && 
                        currentPiece.moduleType === this.lastErrorPiece.moduleType && 
                        currentPiece.tripleIndex === this.lastErrorPiece.tripleIndex) {
                        isCorrectingError = true;
                    }
                }
                
                if (!isCorrectingError) {
                    // 正常正确放置，增加连击计数
                    this.comboCount++;
                    
                    // 计算分数：每正确放置一个方块加1分
                    let pointsEarned = 1;
                    
                    this.score += pointsEarned;
                    
                    // 更新分数显示
                    this.updateScore();
                    
                    // 记录连击和分数信息
                    console.log(`连续正确放置 ${this.comboCount} 次，本次加 ${pointsEarned} 分，总分数：${this.score}`);
                } else {
                    // 纠正错误放置，不加分，并且重置连击计数
                    this.comboCount = 0;
                    console.log(`纠正错误: ${currentPiece.text} (${currentPiece.moduleType}) 放置到正确位置，不加分，连击计数重置为 0`);
                }
                
                // 放置正确，固定方块到游戏板
                for (let r = 0; r < currentPiece.shape.length; r++) {
                    for (let c = 0; c < currentPiece.shape[r].length; c++) {
                        if (currentPiece.shape[r][c]) {
                            const boardY = currentPiece.y + r;
                            const boardX = currentPiece.x + c;

                            // 确保只在游戏区域内固定方块
                            if (boardY >= 0 && boardY < this.rows - 1 && boardX >= 0 && boardX < this.cols) {
                                // 存储方块信息，包括文本内容、模块类型和原始颜色索引
                                // 使用当前方块的colorIndex，确保固定后颜色保持一致
                                this.board[boardY][boardX] = {
                                    type: currentPiece.colorIndex,
                                    text: currentPiece.text,
                                    moduleType: columnType,
                                    tripleIndex: currentPiece.tripleIndex
                                };
                            }
                        }
                    }
                }

                // 更新三元组的完成状态
                this.updateTripleCompletion(currentPiece.tripleIndex, columnType);

                // 播放正确放置的音效
                this.playSound('correct');

                // 重置错误状态，因为方块已经正确放置
                if (isCorrectingError) {
                    this.errorConfirmed = false;
                    this.lastErrorPiece = null;
                    this.correctingError = false;
                }

                // 生成下一个方块
                this.spawnNewPiece();
                this.draw();
            } else {
                // 放置错误，先将方块临时显示在游戏板上
                // 绘制当前方块（不真正固定到游戏板）
                this.draw();

                // 立即显示错误提示，不再有延迟
                this.handleWrongPlacement(currentPiece);
            }
        } else {
            // 其他关卡使用默认的锁定机制
            for (let r = 0; r < this.currentPiece.shape.length; r++) {
                for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
                    if (this.currentPiece.shape[r][c]) {
                        const y = this.currentPiece.y + r;
                        const x = this.currentPiece.x + c;

                        // 确保只在游戏区域内固定方块
                        if (y >= 0 && y < this.rows && x >= 0 && x < this.cols) {
                            this.board[y][x] = this.currentPiece.shapeIndex + 1; // +1 对应colors数组中的有效颜色索引
                        }
                    }
                }
            }

            // 移除消行功能调用
            this.spawnNewPiece();
            this.draw();
        }
    }

    // 更新三元组完成状态
    updateTripleCompletion(tripleIndex, moduleType) {
        // 根据当前关卡选择正确的关卡数据
        let levelData;
        switch (this.level) {
            case 1: levelData = this.level1Data; break;
            case 2: levelData = this.level2Data; break;
            case 3: levelData = this.level3Data; break;
            case 4: levelData = this.level4Data; break;
            case 5: levelData = this.level5Data; break;
            case 6: levelData = this.level6Data; break;
            case 7: levelData = this.level7Data; break;
            case 8: levelData = this.level8Data; break;
            case 9: levelData = this.level9Data; break;
            case 10: levelData = this.level10Data; break;
            default: levelData = this.level1Data; break;
        }

        // 查找或创建该三元组的完成状态记录
        let tripleStatus = levelData.completed.find(t => t.index === tripleIndex);

        if (!tripleStatus) {
            tripleStatus = {
                index: tripleIndex,
                object: false,
                feature: false,
                value: false
            };
            levelData.completed.push(tripleStatus);
        }

        // 更新对应模块类型的完成状态
        tripleStatus[moduleType] = true;

        // 检查三元组是否完全完成
        if (tripleStatus.object && tripleStatus.feature && tripleStatus.value) {
            // 三元组完成，可以考虑显示一些反馈
            console.log(`三元组 ${tripleIndex + 1} 已完成！`);
        }

        // 检查是否所有三元组都已完成（每个关卡有特定数量的三元组）
        const totalTriples = levelData.triples.length; // 使用关卡数据中的实际三元组数量

        // 调试信息：记录当前关卡和完成状态
        console.log(`关卡 ${this.level} - 完成三元组数量: ${levelData.completed.filter(t => t.object && t.feature && t.value).length}/${totalTriples}`);

        // 检查是否所有三元组都已完成（只计算完全完成的三元组）
        const completedTriplesCount = levelData.completed.filter(t => t.object && t.feature && t.value).length;
        if (completedTriplesCount === totalTriples && !this.levelCompleted) {
            // 所有三元组都已完成，触发统一的通关庆祝机制
            console.log(`关卡 ${this.level} 完成！`);
            this.levelCompleted = true;
            this.level1Win();
        }
    }

    // 处理错误放置
    handleWrongPlacement(piece) {
        // 播放错误音效
        this.playSound('wrong');
        
        // 重置连击计数
        this.comboCount = 0;
        
        // 扣除分数：每放置错一个方块扣除1分，可为负值
        this.score -= 1;
        
        // 更新分数显示
        this.updateScore();

        // 记录错误放置的模块信息
        this.errorModule = piece;
        this.errorPosition = { x: piece.x, y: piece.y };
        this.lastErrorPiece = piece;
        this.errorConfirmed = false;

        // 暂停游戏
        this.gamePaused = true;

        // 记录错误放置日志
        console.log(`错误放置: ${piece.text} (${piece.moduleType}) 在位置 (${piece.x}, ${piece.y})，扣分后分数: ${this.score}`);

        // 显示错误提示窗口
        this.showErrorPopup();
    }

    // 显示错误提示窗口
    showErrorPopup() {
        // 获取当前错误模块的信息
        const errorModule = this.errorModule;
        const tripleIndex = errorModule.tripleIndex;
        const moduleType = errorModule.moduleType;
        const originalTripleIndex = errorModule.originalTripleIndex;

        // 获取当前关卡的数据（支持所有关卡）
        const levelData = this.levels[this.level];

        // 获取当前三元组的完整信息
        const currentTriple = levelData.triples[originalTripleIndex];
        const tripleStatus = levelData.completed.find(t => t.index === tripleIndex);

        // 确定当前已完成的模块类型
        let hasObject = tripleStatus && tripleStatus.object;
        let hasFeature = tripleStatus && tripleStatus.feature;
        let hasValue = tripleStatus && tripleStatus.value;

        // 根据不同场景生成提示语
        let messageText = '';

        if (moduleType === 'object') {
            if (hasFeature && !hasValue) {
                // 场景1：有特征，没量值，用户将对象误放
                messageText = `诶哟 \`(*>﹏<*)′\n"${errorModule.text}" 是特征 "${currentTriple.feature}" 关于某一量值的对象哦~\n请再来想一想它应该放置在哪里吧！`;
            } else if (hasFeature && hasValue) {
                // 场景4：有特征和量值，用户将对象误放
                messageText = `诶哟 \`(*>﹏<*)′\n"${errorModule.text}" 是特征 "${currentTriple.feature}" 关于量值为 "${currentTriple.value}" 所对应的对象哦~\n请再来想一想它应该放置在哪里吧！`;
            } else if (!hasFeature && hasValue) {
                // 场景9变种：有量值，没特征，用户将对象误放
                messageText = `诶哟 \`(*>﹏<*)′\n"${errorModule.text}" 是某一特征关于量值为 "${currentTriple.value}" 所对应的对象哦~\n请再来想一想它应该放置在哪里吧！`;
            } else if (!hasObject && !hasFeature && !hasValue) {
                // 场景9：无特征和量值，用户将对象误放
                messageText = `诶哟 \`(*>﹏<*)′\n"${errorModule.text}" 是某一特征关于某一量值所对应的对象哦~\n请再来想一想它应该放置在哪里吧！`;
            }
        } else if (moduleType === 'feature') {
            if (hasObject && hasValue) {
                // 场景5：有对象和量值，用户将特征误放
                messageText = `好像不太对哦 \`(*>﹏<*)′\n"${errorModule.text}" 是对象 "${currentTriple.object}" 关于量值为 "${currentTriple.value}" 所对应的特征哦~\n请再来想一想它应该放置在哪里吧！`;
            } else if (hasObject && !hasValue) {
                // 场景5变种：有对象，没量值，用户将特征误放
                messageText = `好像不太对哦 \`(*>﹏<*)′\n"${errorModule.text}" 是对象 "${currentTriple.object}" 关于某一量值所对应的特征哦~\n请再来想一想它应该放置在哪里吧！`;
            } else if (hasValue && !hasObject) {
                // 场景3：有量值，没对象，用户将特征误放
                messageText = `好像不太对哦 \`(*>﹏<*)′\n"${errorModule.text}" 是某一对象关于量值为 "${currentTriple.value}" 所对应的特征哦~\n请再来想一想它应该放置在哪里吧！`;
            } else if (!hasObject && !hasFeature && !hasValue) {
                // 场景7：无对象和量值，用户将特征误放
                messageText = `好像不太对哦 \`(*>﹏<*)′\n"${errorModule.text}" 是某一对象关于某一量值所对应的特征哦~\n请再来想一想它应该放置在哪里吧！`;
            }
        } else if (moduleType === 'value') {
            if (hasFeature && !hasObject) {
                // 场景2：有特征，没对象，用户将量值误放
                messageText = `等等 \`(*>﹏<*)′\n"${errorModule.text}" 是某一对象关于特征为 "${currentTriple.feature}" 所对应的量值哦~\n请再来想一想它应该放置在哪里吧！`;
            } else if (hasObject && !hasFeature) {
                // 场景2变种：有对象，没特征，用户将量值误放
                messageText = `等等 \`(*>﹏<*)′\n"${errorModule.text}" 是对象 "${currentTriple.object}" 关于某一特征所对应的量值哦~\n请再来想一想它应该放置在哪里吧！`;
            } else if (hasObject && hasFeature) {
                // 场景6：有对象和特征，用户将量值误放
                messageText = `等等 \`(*>﹏<*)′\n"${errorModule.text}" 是对象 "${currentTriple.object}" 关于特征为 "${currentTriple.feature}" 所对应的量值哦~\n请再来想一想它应该放置在哪里吧！`;
            } else if (!hasObject && !hasFeature && !hasValue) {
                // 场景8：无对象和特征，用户将量值误放
                messageText = `等等 \`(*>﹏<*)′\n"${errorModule.text}" 是某一对象关于某一特征所对应的量值哦~\n请再来想一想它应该放置在哪里吧！`;
            }
        }

        // 如果没有匹配到任何场景，使用默认提示语
        if (!messageText) {
            messageText = `放置错误！请将"${errorModule.text}"放置在正确的列中。`;
        }

        // 创建提示窗口元素
        let popup = document.getElementById('errorPopup');

        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'errorPopup';
            popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(255, 255, 255, 0.9);
                border: 2px solid #E53935;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                z-index: 1000;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            `;

            const message = document.createElement('p');
            message.innerHTML = messageText.replace(/\n/g, '<br>');
            message.style.cssText = 'font-size: 16px; color: #333; margin-bottom: 20px; line-height: 1.5;';

            const button = document.createElement('button');
            button.textContent = '记住了';
            button.style.cssText = `
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            `;

            button.addEventListener('click', () => {
                this.hideErrorPopup();
            });

            popup.appendChild(message);
            popup.appendChild(button);
            document.body.appendChild(popup);
        } else {
            // 更新现有窗口的消息
            const message = popup.querySelector('p');
            message.innerHTML = messageText.replace(/\n/g, '<br>');
            popup.style.display = 'block';
        }
    }

    // 隐藏错误提示窗口
    hideErrorPopup() {
        const popup = document.getElementById('errorPopup');
        if (popup) {
            popup.style.display = 'none';
        }

        // 记录用户已确认错误提示
        this.errorConfirmed = true;
        
        // 标记正在纠正错误
        this.correctingError = true;

        // 记录错误确认日志
        if (this.lastErrorPiece) {
            console.log(`用户确认错误: ${this.lastErrorPiece.text} (${this.lastErrorPiece.moduleType})`);
        }

        // 恢复游戏
        this.gamePaused = false;

        // 重新生成当前模块
        this.spawnNewPiece();

        // 重置自动下降时间，确保方块会自动下降
        this.lastDropTime = 0;

        this.draw();

        // 确保游戏主循环继续运行
        if (this.gameRunning) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    // 清除完整的行 - 功能已移除
    clearLines() {
        // 不再清除完整的行
        // 方块会在游戏板上累积
    }

    // 绘制游戏
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制游戏板
        this.drawBoard();

        // 只有在游戏运行时才绘制当前方块
        if (this.gameRunning) {
            // 绘制当前方块
            this.drawPiece(this.currentPiece);
        }

        // 绘制下一个方块
        this.drawNextPiece();
    }

    // 绘制游戏板
    drawBoard() {
        // 绘制深色背景
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格线
        this.ctx.lineWidth = 1;

        // 绘制横向网格线
        for (let r = 0; r <= this.rows; r++) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, r * this.blockSize);
            this.ctx.lineTo(this.cols * this.blockSize, r * this.blockSize);
            this.ctx.stroke();
        }

        // 绘制竖向网格线
        for (let c = 0; c <= this.cols; c++) {
            // 第4格和第8格的竖向格子线透明度更高
            if (c === 4 || c === 8) {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            } else {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            }
            this.ctx.beginPath();
            this.ctx.moveTo(c * this.blockSize, 0);
            this.ctx.lineTo(c * this.blockSize, this.rows * this.blockSize);
            this.ctx.stroke();
        }

        // 只有在游戏运行时才绘制已固定的方块
        if (this.gameRunning) {
            // 绘制已固定的方块（先不绘制文本）
            const drawnPieces = new Set(); // 用于跟踪已经绘制过文本的方块

            for (let r = 0; r < this.rows; r++) {
                // 跳过底部1行，这些行将用于绘制固定的标签方块
                if (this.showLabels && r >= this.rows - 1) continue;

                for (let c = 0; c < this.cols; c++) {
                    const cell = this.board[r][c];
                    if (cell !== 0) {
                        if (typeof cell === 'object') {
                            // 第一关卡和第二关卡，cell是对象，包含type和text
                            // 绘制方块单元格，但不包含文本（文本将在最后统一绘制）
                            this.drawCell(c, r, this.colors[cell.type]);
                        } else {
                            // 其他关卡，cell是数字
                            this.drawCell(c, r, this.colors[cell]);
                        }
                    }
                }
            }

            // 然后，为所有1x4条形方块绘制文本（第1-10关卡）
            if (this.level >= 1 && this.level <= 10) {
                for (let r = 0; r < this.rows; r++) {
                    if (this.showLabels && r >= this.rows - 1) continue;

                    for (let c = 0; c < this.cols; c++) {
                        const cell = this.board[r][c];
                        if (cell !== 0 && typeof cell === 'object') {
                            // 检查是否已经为这个方块绘制过文本
                            const pieceKey = `${cell.tripleIndex}-${cell.moduleType}`;
                            if (!drawnPieces.has(pieceKey)) {
                                // 获取1x4方块的完整信息
                                const pieceInfo = this.getPieceInfo(c, r, cell);
                                if (pieceInfo) {
                                    // 在整个1x4方块的中心位置绘制文本
                                    this.drawTextOnPiece(
                                        pieceInfo.startX,
                                        pieceInfo.y,
                                        pieceInfo.text,
                                        this.colors[cell.type]
                                    );
                                    // 标记这个方块已经绘制过文本
                                    drawnPieces.add(pieceKey);
                                }
                            }
                        }
                    }
                }
            }

            // 绘制底部固定的标签方块
            if (this.showLabels) {
                this.drawLabeledBlocks();
            }
        }
    }

    // 获取1x4方块的完整信息（用于显示文本）
    getPieceInfo(x, y, cell) {
        // 查找当前1x4条形方块的所有单元格
        const pieceCells = [];
        for (let dx = -3; dx <= 3; dx++) {
            const checkX = x + dx;
            if (checkX >= 0 && checkX < this.cols) {
                const checkCell = this.board[y][checkX];
                if (checkCell && typeof checkCell === 'object' &&
                    checkCell.tripleIndex === cell.tripleIndex &&
                    checkCell.moduleType === cell.moduleType) {
                    pieceCells.push(checkX);
                }
            }
        }

        // 按x坐标排序
        pieceCells.sort((a, b) => a - b);

        // 如果找到4个连续的格子（1x4条形方块），返回方块信息
        if (pieceCells.length === 4 && pieceCells[3] - pieceCells[0] === 3) {
            return {
                startX: pieceCells[0],
                endX: pieceCells[3],
                centerX: pieceCells[0] + 2,
                y: y,
                text: cell.text
            };
        }

        return null;
    }

    // 绘制底部固定的标签方块
    drawLabeledBlocks() {
        // 标签内容
        const labels = ['对象', '特征', '量值'];
        // 标签颜色 - 使用colors数组中的索引1-3

        // 每个标签方块占据4列，总共有12列（3个标签 * 4列）
        const blockWidth = 4; // 每个标签方块的宽度（列数）
        const startRow = this.rows - 1; // 开始行（底部最后一行）

        for (let i = 0; i < labels.length; i++) {
            const startCol = i * blockWidth;
            const color = this.colors[i + 1]; // 使用colors数组中的索引1-3
            const label = labels[i];

            // 绘制1x4的标签方块
            for (let c = 0; c < 4; c++) {
                this.drawCell(startCol + c, startRow, color);
            }

            // 在整个1x4标签方块的中心位置绘制文字
            this.drawTextOnPiece(startCol, startRow, label, color);
        }
    }

    // 绘制方块
    drawPiece(piece) {
        // 首先绘制所有方块单元格（不包含文本）
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    const drawX = piece.x + c;
                    const drawY = piece.y + r;
                    // 确保只在游戏区域内绘制
                    if (drawX >= 0 && drawX < this.cols && drawY >= 0 && drawY < this.rows) {
                        // 绘制方块单元格，但不包含文本（文本将在最后统一绘制）
                        this.drawCell(drawX, drawY, piece.color);
                    }
                }
            }
        }

        // 然后，对于1x4的条形方块，在整个方块的中心位置绘制文本（使用新的自适应文本渲染）
        if (piece.text && piece.shape.length === 1 && piece.shape[0].length === 4) {
            // 计算整个1x4方块的像素坐标
            const xPos = piece.x * this.blockSize;
            const yPos = piece.y * this.blockSize;
            const width = 4 * this.blockSize;
            const height = this.blockSize;

            // 设置文本样式
            let fontSize = 14;
            this.ctx.font = `bold ${fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // 添加阴影效果
            this.ctx.shadowColor = '#000000';
            this.ctx.shadowBlur = 2;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;

            // 保存当前字体设置
            const originalFont = this.ctx.font;

            // 手动计算文本换行，不使用wrapText方法，避免字体大小被重置
            let wrappedLines = [piece.text];
            let currentFontSize = fontSize;

            // 尝试调整字体大小
            while (currentFontSize > 8) {
                this.ctx.font = `bold ${currentFontSize}px Arial`;
                const textWidth = this.ctx.measureText(piece.text).width;
                
                if (textWidth <= width - 10) {
                    break;
                }
                currentFontSize--;
            }

            // 如果调整到最小字体还是放不下，就手动换行
            if (this.ctx.measureText(piece.text).width > width - 10) {
                wrappedLines = [];
                let currentLine = '';
                
                for (let i = 0; i < piece.text.length; i++) {
                    const char = piece.text[i];
                    const testLine = currentLine + char;
                    
                    if (this.ctx.measureText(testLine).width <= width - 10) {
                        currentLine = testLine;
                    } else {
                        wrappedLines.push(currentLine);
                        currentLine = char;
                    }
                }
                
                if (currentLine) {
                    wrappedLines.push(currentLine);
                }
            }

            // 重新计算最长行并最终调整字体大小
            const longestLine = wrappedLines.reduce((a, b) => this.ctx.measureText(a).width > this.ctx.measureText(b).width ? a : b, '');
            while (this.ctx.measureText(longestLine).width > width - 10 && currentFontSize > 8) {
                currentFontSize--;
                this.ctx.font = `bold ${currentFontSize}px Arial`;
            }

            // 计算总行高和起始位置
            const lineHeight = currentFontSize * 1.2;
            const totalHeight = wrappedLines.length * lineHeight;
            const startY = yPos + (height - totalHeight) / 2 + lineHeight / 2;

            // 绘制每一行文本
            this.ctx.fillStyle = '#ffffff';
            wrappedLines.forEach((line, index) => {
                this.ctx.fillText(line, xPos + width / 2, startY + index * lineHeight);
            });

            // 重置字体和阴影设置
            this.ctx.font = originalFont;
            this.ctx.shadowBlur = 0;
        }
    }

    // 绘制下一个方块
    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

        const blockSize = 20;
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;

        // 首先绘制所有方块单元格（不包含文本）
        for (let r = 0; r < this.nextPiece.shape.length; r++) {
            for (let c = 0; c < this.nextPiece.shape[r].length; c++) {
                if (this.nextPiece.shape[r][c]) {
                    // 绘制方块主体
                    this.nextCtx.fillStyle = this.nextPiece.color;
                    this.nextCtx.fillRect(
                        offsetX + c * blockSize,
                        offsetY + r * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                    this.nextCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    this.nextCtx.lineWidth = 1;
                    this.nextCtx.strokeRect(
                        offsetX + c * blockSize,
                        offsetY + r * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            }
        }

        // 然后，对于1x4的条形方块，在整个方块的中心位置绘制文本
        if (this.nextPiece.text && this.nextPiece.shape.length === 1 && this.nextPiece.shape[0].length === 4) {
            const width = 4 * blockSize;

            // 使用新的自适应文本渲染逻辑
            const wrappedLines = this.wrapText(this.nextPiece.text, width - 10, this.nextCtx, 10, 6);

            // 设置文本样式
            let fontSize = 10;
            this.nextCtx.font = `bold ${fontSize}px Arial`;
            this.nextCtx.textAlign = 'center';
            this.nextCtx.textBaseline = 'middle';
            this.nextCtx.fillStyle = '#ffffff';

            // 自动调整字体大小
            while (this.nextCtx.measureText(this.nextPiece.text).width > width - 10 && fontSize > 6) {
                fontSize--;
                this.nextCtx.font = `bold ${fontSize}px Arial`;
            }

            // 计算总行高和起始位置
            const lineHeight = fontSize * 1.2;
            const totalHeight = wrappedLines.length * lineHeight;
            const startY = offsetY + (blockSize - totalHeight) / 2 + lineHeight / 2;

            // 绘制每一行文本
            wrappedLines.forEach((line, index) => {
                this.nextCtx.fillText(line, offsetX + width / 2, startY + index * lineHeight);
            });
        }
    }

    // 绘制单个单元格
    drawCell(x, y, color, text = null) {
        // 计算单元格坐标
        const xPos = x * this.blockSize;
        const yPos = y * this.blockSize;

        // 1. 先绘制完整的方块主体，确保没有空隙
        this.ctx.fillStyle = color;
        this.ctx.fillRect(xPos, yPos, this.blockSize, this.blockSize);

        // 2. 添加边框效果（使用稍浅的颜色，增强轮廓但避免黑色间隙）
        this.ctx.strokeStyle = this.lightenColor(color, 0.2);
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(xPos, yPos, this.blockSize, this.blockSize);

        // 3. 添加内部高光效果，使其更立体（使用渐变替代固定颜色，避免色块间的明显界限）
        const gradient = this.ctx.createLinearGradient(xPos, yPos, xPos + this.blockSize, yPos + this.blockSize);
        gradient.addColorStop(0, this.lightenColor(color, 0.4));
        gradient.addColorStop(1, color);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(xPos + 1, yPos + 1, this.blockSize - 2, this.blockSize - 2);
    }

    // 文本换行辅助方法
    wrapText(text, maxWidth, ctx, maxFontSize, minFontSize) {
        // 保存当前字体设置
        const originalFont = ctx.font;
        let currentFontSize = maxFontSize;

        // 先尝试缩小字体看是否能容纳
        while (true) {
            ctx.font = `bold ${currentFontSize}px Arial`;
            const textWidth = ctx.measureText(text).width;

            if (textWidth <= maxWidth || currentFontSize <= minFontSize) {
                break;
            }

            currentFontSize--;
        }

        // 如果缩小到最小字体还是放不下，就需要换行
        if (ctx.measureText(text).width > maxWidth) {
            const words = text.split('');
            const lines = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                const testLine = currentLine + words[i];
                const metrics = ctx.measureText(testLine);

                if (metrics.width <= maxWidth) {
                    currentLine = testLine;
                } else {
                    lines.push(currentLine);
                    currentLine = words[i];
                }
            }

            lines.push(currentLine);

            // 恢复原始字体设置
            ctx.font = originalFont;

            return lines;
        }

        // 恢复原始字体设置
        ctx.font = originalFont;

        // 如果不需要换行，返回原文本
        return [text];
    }

    // 在整个1x4方块上绘制文本
    drawTextOnPiece(startX, y, text, color) {
        // 计算整个1x4方块的像素坐标
        const xPos = startX * this.blockSize;
        const yPos = y * this.blockSize;
        const width = 4 * this.blockSize;
        const height = this.blockSize;

        // 使用新的自适应文本渲染方法
        const wrappedLines = this.wrapText(text, width - 10, this.ctx, 14, 8);

        // 设置文本样式
        let fontSize = 14;
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#ffffff';

        // 添加阴影效果
        this.ctx.shadowColor = '#000000';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // 自动调整字体大小
        const longestLine = wrappedLines.reduce((a, b) => a.length > b.length ? a : b, '');
        while (this.ctx.measureText(longestLine).width > width - 10 && fontSize > 8) {
            fontSize--;
            this.ctx.font = `bold ${fontSize}px Arial`;
        }

        // 计算总行高和起始位置
        const lineHeight = fontSize * 1.2;
        const totalHeight = wrappedLines.length * lineHeight;
        const startY = yPos + (height - totalHeight) / 2 + lineHeight / 2;

        // 绘制每一行文本
        wrappedLines.forEach((line, index) => {
            this.ctx.fillText(line, xPos + width / 2, startY + index * lineHeight);
        });

        // 重置阴影设置
        this.ctx.shadowBlur = 0;
    }

    // 绘制底部固定的标签方块
    drawLabeledBlocks() {
        // 标签内容
        const labels = ['对象', '特征', '量值'];
        // 标签颜色 - 充满活力的蓝色系、绿色系和红色系
        const labelColors = ['#1E88E5', '#43A047', '#E53935'];

        // 每个标签方块占据4列，总共有12列（3个标签 * 4列）
        const blockWidth = 4; // 每个标签方块的宽度（列数）
        const startRow = this.rows - 1; // 开始行（底部最后一行）

        for (let i = 0; i < labels.length; i++) {
            const startCol = i * blockWidth;
            const color = labelColors[i];
            const label = labels[i];

            // 绘制1x4的标签方块（现在是1行高度）
            for (let c = 0; c < 4; c++) {
                this.drawCell(startCol + c, startRow, color);
            }

            // 在方块中心绘制文字 - 添加白色底和黑色描边效果
            const x = startCol * this.blockSize;
            const y = startRow * this.blockSize;
            const width = blockWidth * this.blockSize;
            const height = this.blockSize;

            // 设置文字样式
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // 添加文字阴影效果，替代黑色描边
            this.ctx.shadowColor = '#000000';
            this.ctx.shadowBlur = 2;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;

            // 绘制白色文字，带有阴影效果
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(label, x + width / 2, y + height / 2);

            // 重置阴影设置，避免影响其他元素绘制
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
        }
    }

    // 辅助方法：加深颜色
    darkenColor(color, factor) {
        // 移除#号
        color = color.replace(/^#/, '');

        // 解析RGB值
        let r = parseInt(color.substring(0, 2), 16);
        let g = parseInt(color.substring(2, 4), 16);
        let b = parseInt(color.substring(4, 6), 16);

        // 减少亮度
        r = Math.max(0, Math.floor(r * (1 - factor)));
        g = Math.max(0, Math.floor(g * (1 - factor)));
        b = Math.max(0, Math.floor(b * (1 - factor)));

        // 转换回十六进制
        const rHex = r.toString(16).padStart(2, '0');
        const gHex = g.toString(16).padStart(2, '0');
        const bHex = b.toString(16).padStart(2, '0');

        return `#${rHex}${gHex}${bHex}`;
    }

    // 旋转矩阵
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                rotated[c][rows - 1 - r] = matrix[r][c];
            }
        }

        return rotated;
    }

    // 创建音效
    createSound(frequency, duration) {
        return {
            frequency: frequency,
            duration: duration
        };
    }

    // 辅助函数：使颜色变亮
    lightenColor(color, factor) {
        // 移除#号
        color = color.replace(/^#/, '');

        // 解析RGB值
        let r = parseInt(color.substring(0, 2), 16);
        let g = parseInt(color.substring(2, 4), 16);
        let b = parseInt(color.substring(4, 6), 16);

        // 增加亮度
        r = Math.min(255, Math.floor(r * (1 + factor)));
        g = Math.min(255, Math.floor(g * (1 + factor)));
        b = Math.min(255, Math.floor(b * (1 + factor)));

        // 转换回十六进制
        const rHex = r.toString(16).padStart(2, '0');
        const gHex = g.toString(16).padStart(2, '0');
        const bHex = b.toString(16).padStart(2, '0');

        return `#${rHex}${gHex}${bHex}`;
    }

    // 播放音效
    playSound(soundName) {
        // 检查冷却时间，防止音效持续播放
        const now = Date.now();
        if (this.soundCooldowns[soundName] && (now - this.soundCooldowns[soundName] < this.soundCooldownTime)) {
            return;
        }
        this.soundCooldowns[soundName] = now;

        try {
            const sound = this.sounds[soundName];

            // 延迟创建或重用音频上下文
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (Array.isArray(sound.frequency)) {
                // 播放和弦
                sound.frequency.forEach((freq, index) => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);

                    oscillator.frequency.value = freq;
                    oscillator.type = 'sine';

                    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + index * 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.05 + sound.duration);

                    oscillator.start(this.audioContext.currentTime + index * 0.05);
                    oscillator.stop(this.audioContext.currentTime + index * 0.05 + sound.duration);
                });
            } else {
                // 播放单个音符
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.value = sound.frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);

                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + sound.duration);
            }
        } catch (e) {
            // 如果浏览器不支持音频API，忽略错误
            console.log('Audio not supported');
        }
    }

    // 更新分数显示
    updateScore() {
        // 获取当前关卡的最高分
        const levelHighScoreKey = `tetrisHighScore_${this.level}`;
        const currentLevelHighScore = parseInt(localStorage.getItem(levelHighScoreKey) || '0');
        
        // 更新分数显示
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = currentLevelHighScore;
        
        // 更新连击次数显示
        if (document.getElementById('combo')) {
            document.getElementById('combo').textContent = this.comboCount;
        }

        // 使用物元名称显示关卡
        const elementName = this.elementNames[this.level] || this.level;
        document.getElementById('level').textContent = elementName;

        // 检查是否打破当前关卡的最高分记录
        if (this.score > currentLevelHighScore) {
            // 更新最高分并保存到localStorage
            localStorage.setItem(levelHighScoreKey, this.score.toString());
            document.getElementById('highScore').textContent = this.score;
        }
    }

    // 开始游戏
    start() {
        if (this.gameRunning && this.gamePaused) {
            // 继续游戏
            this.gamePaused = false;
            document.getElementById('pauseBtn').textContent = '暂停';
            document.getElementById('pauseBtn').disabled = false;
            this.gameLoop();
        } else {
            // 开始新游戏或进入下一关
            this.gameRunning = true;
            this.gamePaused = false;
            this.levelCompleted = false;
            this.showLabels = true; // 显示底部固定标签
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('pauseBtn').textContent = '暂停';

            // 重置游戏状态，但保留当前关卡设置
            this.board = this.createBoard();
            this.score = 0;
            // 不重置level，保留当前关卡设置
            this.lines = 0;
            this.dropInterval = 1000;

            // 更新分数显示
            this.updateScore();

            // 生成新方块
            this.spawnNewPiece();

            this.gameLoop();
        }
    }

    // 暂停游戏
    pause() {
        if (this.gameRunning && !this.gamePaused) {
            // 暂停游戏
            this.gamePaused = true;
            document.getElementById('pauseBtn').textContent = '继续';
            cancelAnimationFrame(this.gameLoopId);
        } else if (this.gameRunning && this.gamePaused) {
            // 恢复游戏
            this.gamePaused = false;
            document.getElementById('pauseBtn').textContent = '暂停';
            this.lastDropTime = 0; // 重置下落时间，避免暂停后立即下落
            this.gameLoop();

            // 隐藏关卡选择模态框
            document.getElementById('levelSelectModal').classList.remove('show');
        }
    }

    // 显示关卡选择界面
    levelSelect() {
        if (this.gameRunning) {
            // 如果游戏正在运行且未暂停，先暂停游戏
            if (!this.gamePaused) {
                this.gamePaused = true;
                document.getElementById('pauseBtn').textContent = '继续';
                cancelAnimationFrame(this.gameLoopId);
            }

            // 显示关卡选择模态框
            document.getElementById('levelSelectModal').classList.add('show');
        }
    }

    // 重置游戏
    reset() {
        // 暂停游戏进程
        if (this.gameRunning && !this.gamePaused) {
            this.gamePaused = true;
            cancelAnimationFrame(this.gameLoopId);
            document.getElementById('pauseBtn').textContent = '继续';
        }

        // 显示自定义确认弹窗
        this.showConfirmModal();
    }

    // 确认重置游戏
    confirmReset() {
        this.hideConfirmModal();

        this.gameRunning = false;
        this.gamePaused = false;
        this.levelCompleted = false;
        this.showLabels = false; // 隐藏底部固定标签
        cancelAnimationFrame(this.gameLoopId);

        this.board = this.createBoard();
        this.score = 0;
        this.comboCount = 0; // 重置连击计数
        this.level = 1;
        this.lines = 0;
        this.dropInterval = 1000;
        this.currentPiece = null;
        this.nextPiece = null;
        this.levelCompleted = false; // 重置关卡完成标志
        
        // 更新分数显示
        this.updateScore();

        // 使用统一方法重置所有关卡数据
        this.resetAllLevels();

        // 重置第一关卡数据
        this.level1Data.currentIndex = 0;
        this.level1Data.completed = [];
        this.level1Data.initDropOrders(); // 重新初始化随机掉落顺序

        // 重置第二关卡数据
        this.level2Data.currentIndex = 0;
        this.level2Data.completed = [];
        this.level2Data.initDropOrders(); // 重新初始化随机掉落顺序

        // 修复：重置第三关卡数据
        this.level3Data.currentIndex = 0;
        this.level3Data.completed = [];
        this.level3Data.initDropOrders(); // 重新初始化随机掉落顺序

        this.spawnNewPiece();
        this.draw();
        this.updateScore();

        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = '暂停';
        document.getElementById('gameOverModal').classList.remove('show');
        document.getElementById('winModal').classList.remove('show');
        document.getElementById('level1WinModal').classList.remove('show');
    }

    // 显示确认弹窗
    showConfirmModal() {
        const confirmModal = document.getElementById('confirmModal');
        confirmModal.classList.add('show');

        // 添加事件监听器（使用once确保只触发一次）
        document.getElementById('confirmBtn').addEventListener('click', () => {
            this.confirmReset();
        }, { once: true });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideConfirmModal();

            // 如果游戏在重置前是运行状态，则恢复游戏
            if (this.gameRunning) {
                this.gamePaused = false;
                document.getElementById('pauseBtn').textContent = '暂停';
                this.gameLoop();
            }
        }, { once: true });
    }

    // 隐藏确认弹窗
    hideConfirmModal() {
        const confirmModal = document.getElementById('confirmModal');
        confirmModal.classList.remove('show');
    }

    // 游戏主循环
    gameLoop(timestamp) {
        if (!this.gameRunning) return;

        // 只有在游戏未暂停时才执行自动下降
        if (!this.gamePaused) {
            if (!timestamp) timestamp = 0;

            if (timestamp - this.lastDropTime > this.dropInterval) {
                this.move(0, 1);
                this.lastDropTime = timestamp;
            }
        }

        // 检查第一关是否通关
        if (this.level === 1 && this.level1Data.completed.length === 11 && this.level1Data.completed.every(t => t.object && t.feature && t.value) && !this.levelCompleted) {
            this.levelCompleted = true;
            this.level1Win();
        }
        // 检查第二关是否通关
        else if (this.level === 2 && this.level2Data.completed.length === 16 && this.level2Data.completed.every(t => t.object && t.feature && t.value) && !this.levelCompleted) {
            this.levelCompleted = true;
            this.level1Win();
        }
        // 修复：检查第三关是否通关
        else if (this.level === 3 && this.level3Data.completed.length === 16 && this.level3Data.completed.every(t => t.object && t.feature && t.value) && !this.levelCompleted) {
            this.levelCompleted = true;
            this.level1Win();
        }
        // 检查第4关是否通关
        else if (this.level === 4 && this.level4Data.completed.length === 16 && this.level4Data.completed.every(t => t.object && t.feature && t.value) && !this.levelCompleted) {
            this.levelCompleted = true;
            this.level1Win();
        }
        // 检查第5关是否通关
        else if (this.level === 5 && this.level5Data.completed.length === 17 && this.level5Data.completed.every(t => t.object && t.feature && t.value) && !this.levelCompleted) {
            this.levelCompleted = true;
            this.level1Win();
        }
        // 检查第6关是否通关
        else if (this.level === 6 && this.level6Data.completed.length === 6 && this.level6Data.completed.every(t => t.object && t.feature && t.value) && !this.levelCompleted) {
            this.levelCompleted = true;
            this.level1Win();
        }
        // 检查第7关是否通关
        else if (this.level === 7 && this.level7Data.completed.length === 13 && this.level7Data.completed.every(t => t.object && t.feature && t.value) && !this.levelCompleted) {
            this.levelCompleted = true;
            this.level1Win();
        }
        // 检查第8关是否通关
        else if (this.level === 8 && this.level8Data.completed.length === 17 && this.level8Data.completed.every(t => t.object && t.feature && t.value) && !this.levelCompleted) {
            this.levelCompleted = true;
            this.level1Win();
        }
        // 检查第9关是否通关
        else if (this.level === 9 && this.level9Data.completed.length === 7 && this.level9Data.completed.every(t => t.object && t.feature && t.value) && !this.levelCompleted) {
            this.levelCompleted = true;
            this.level1Win();
        }

        // 绘制游戏画面，避免闪烁
        this.draw();

        this.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    // 移除庆祝效果
    triggerCelebration() {
        // 取消所有庆祝反馈机制
        return;
    }

    // 移除彩带粒子生成
    generateConfetti(container) {
        // 取消彩带粒子效果
        return;
    }

    // 游戏通关
    gameWin() {
        this.gameRunning = false;
        cancelAnimationFrame(this.gameLoopId);

        // 移除庆祝效果

        // 显示通关模态框
        document.getElementById('winScore').textContent = this.score;
        document.getElementById('winModal').classList.add('show');

        // 按钮状态更新
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }



    // 选择关卡功能
    // 检查关卡是否可以选择
    canSelectLevel(levelNum) {
        // 1-6关保持自由选择模式，无前置解锁要求
        if (levelNum <= 6) {
            return true;
        }
        // 7关及以上需要顺序解锁
        else {
            // 如果已经通过了前一关，则可以选择
            return this.completedLevels.includes(levelNum - 1);
        }
    }

    // 显示关卡锁定提示弹窗
    showLevelLockModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.backgroundColor = 'white';
        content.style.padding = '30px';
        content.style.borderRadius = '10px';
        content.style.textAlign = 'center';
        content.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
        content.style.maxWidth = '400px';
        content.style.width = '90%';

        const title = document.createElement('h2');
        title.textContent = '温馨提示';
        title.style.marginTop = '0';
        title.style.color = '#333';
        title.style.fontSize = '24px';

        const message = document.createElement('p');
        message.textContent = '从第7关开始需要按顺序解锁，完成前一关后才能挑战当前关卡';
        message.style.color = '#666';
        message.style.marginBottom = '20px';
        message.style.fontSize = '16px';

        const button = document.createElement('button');
        button.textContent = '知道了';
        button.className = 'btn';
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '10px 20px';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '16px';
        button.onclick = () => {
            document.body.removeChild(modal);
        };

        content.appendChild(title);
        content.appendChild(message);
        content.appendChild(button);
        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    // 更新关卡选择界面
    updateLevelSelectUI() {
        const levelButtons = document.querySelectorAll('.level-btn');

        levelButtons.forEach((button, index) => {
            const levelNum = index + 1;
            
            // 清除之前的类名
            button.classList.remove('locked', 'completed');
            
            // 检查关卡是否可以选择
            if (this.canSelectLevel(levelNum)) {
                // 可以选择的关卡
                if (this.completedLevels.includes(levelNum)) {
                    button.classList.add('completed');
                    button.innerHTML = `第${levelNum}关：${this.elementNames[levelNum]}`;
                } else {
                    // 未完成但已解锁的关卡
                    button.innerHTML = `第${levelNum}关：${this.elementNames[levelNum]}`;
                }
                button.disabled = false;
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            } else {
                // 锁定的关卡
                button.classList.add('locked');
                button.innerHTML = `🔒 第${levelNum}关：${this.elementNames[levelNum]}`;
                button.disabled = true;
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
            }
        });
    }

    selectLevel(levelNum) {
        // 检查关卡是否可以选择
        if (!this.canSelectLevel(levelNum)) {
            this.showLevelLockModal();
            return;
        }

        // 隐藏关卡选择模态框
        document.getElementById('levelSelectModal').classList.remove('show');

        // 播放音效
        this.playSound('correct');

        // 重置当前关卡的完成状态
        this.levelCompleted = false;

        // 设置新关卡
        this.level = levelNum;
        this.score = 0;
        this.comboCount = 0; // 重置连击计数

        // 重置新关卡的数据
        const levelData = this[`level${this.level}Data`];
        if (levelData) {
            levelData.currentIndex = 0;
            levelData.completed = [];
            levelData.initDropOrders();
        }

        // 更新关卡显示和分数
        this.updateScore();

        // 重置游戏板
        this.board = this.createBoard();

        // 生成新方块
        this.spawnNewPiece();

        // 重新绘制游戏
        this.draw();

        // 显示提示信息
        console.log(`已选择第${this.level}关: ${this.elementNames[this.level]}`);

        // 如果游戏正在运行且暂停，恢复游戏
        if (this.gameRunning && this.gamePaused) {
            this.gamePaused = false;
            document.getElementById('pauseBtn').textContent = '暂停';
            this.lastDropTime = 0;
            this.gameLoop();
        }
    }

    // 关卡通关
    level1Win() {
        this.gameRunning = false;
        cancelAnimationFrame(this.gameLoopId);

        // 记录关卡通关状态
        if (!this.completedLevels.includes(this.level)) {
            this.completedLevels.push(this.level);
            localStorage.setItem('completedLevels', JSON.stringify(this.completedLevels));
            console.log(`关卡 ${this.level} 通关，已保存到本地存储`);
        }

        // 触发庆祝流程
        this.triggerLevel1Celebration();
    }

    // 触发第一关庆祝流程
    triggerLevel1Celebration() {
        // 播放胜利音效
        this.playSound('level1Celebration');

        // 创建自下而上绽放的烟花特效
        this.createFireworks();

        // 立即显示弹窗，与音效和烟花同时呈现
        this.showLevel1WinModal();
    }

    // 创建自下而上绽放的烟花特效
    createFireworks() {
        const colors = ['#FF5722', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'];
        const fireworkCount = 10; // 减少数量以提高性能

        // 获取游戏容器的位置和尺寸，确保烟花在游戏区域内绽放
        const gameContainer = document.querySelector('.game-container') || document.body;
        const containerRect = gameContainer.getBoundingClientRect();
        const containerX = containerRect.left;
        const containerY = containerRect.top;
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // 创建多个烟花
        for (let i = 0; i < fireworkCount; i++) {
            setTimeout(() => {
                // 随机选择烟花发射位置（底部区域）
                const startX = containerX + Math.random() * containerWidth;
                const startY = containerY + containerHeight;

                // 随机选择烟花绽放位置（上方区域）
                const explodeX = containerX + Math.random() * containerWidth;
                const explodeY = containerY + Math.random() * (containerHeight * 0.7); // 保持合适的绽放区域

                // 随机选择颜色和大小
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size = Math.random() * 5 + 4; // 略微减小大小（4-9px）以提高性能
                const speed = Math.random() * 0.8 + 0.8; // 加快上升速度（0.8-1.6秒）
                const explodeDuration = Math.random() * 0.5 + 0.8; // 缩短绽放时间（0.8-1.3秒）

                // 创建烟花发射轨迹（更简洁的轨迹线，提高性能）
                const trail = document.createElement('div');
                trail.className = 'firework-trail';
                trail.style.position = 'fixed';
                trail.style.left = startX + 'px';
                trail.style.top = startY + 'px';
                trail.style.width = '2px'; // 略微减窄轨迹
                trail.style.height = '12px'; // 略微减短轨迹
                trail.style.backgroundColor = color;
                trail.style.opacity = '1'; // 增加不透明度以弥补简化的视觉效果
                trail.style.zIndex = '999';
                trail.style.pointerEvents = 'none';
                trail.style.borderRadius = '1px';

                document.body.appendChild(trail);

                // 动画：烟花上升到绽放位置
                setTimeout(() => {
                    // 使用transform代替left/top改变，提高动画性能
                    trail.style.transition = `transform ${speed}s cubic-bezier(0.1, 0.8, 0.2, 1), opacity ${speed}s ease-out`;
                    const translateX = explodeX - startX;
                    const translateY = explodeY - startY;
                    trail.style.transform = `translate(${translateX}px, ${translateY}px)`;
                    trail.style.opacity = '0.2';
                }, 10);

                // 烟花上升到顶点后绽放
                setTimeout(() => {
                    // 移除轨迹
                    if (trail.parentNode) {
                        trail.parentNode.removeChild(trail);
                    }

                    // 创建烟花绽放效果
                    this.createFireworkBurst(explodeX, explodeY, color, size, explodeDuration);
                }, speed * 1000);

            }, i * 200); // 进一步缩短发射间隔（200ms），减少延迟感
        }
    }

    // 创建烟花绽放效果
    createFireworkBurst(x, y, color, size, duration) {
        const particleCount = 40; // 减少粒子数量以提高性能
        const particleColors = this.getFireworkColors(color); // 获取烟花粒子颜色

        for (let i = 0; i < particleCount; i++) {
            // 创建烟花粒子
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            particle.style.position = 'fixed';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = size + Math.random() * 3 + 1 + 'px'; // 略微减小粒子大小
            particle.style.height = size + Math.random() * 3 + 1 + 'px';
            particle.style.backgroundColor = particleColors[Math.floor(Math.random() * particleColors.length)];
            particle.style.borderRadius = '50%'; // 圆形粒子
            particle.style.opacity = '0';
            particle.style.zIndex = '1000';
            particle.style.pointerEvents = 'none';

            document.body.appendChild(particle);

            // 随机计算粒子的运动方向和距离
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.6 - 0.3); // 略微减少随机性
            const distance = Math.random() * 100 + 70; // 略微减小运动距离（70-170px）

            // 应用动画
            setTimeout(() => {
                // 初始绽放动画
                particle.style.transition = `opacity 0.05s ease-out`;
                particle.style.opacity = '1';

                // 向外扩散动画
                setTimeout(() => {
                    // 使用transform代替left/top改变，提高动画性能
                    const translateX = Math.cos(angle) * distance;
                    const translateY = Math.sin(angle) * distance;
                    particle.style.transition = `transform ${duration}s ease-out, opacity ${duration}s ease-out`;
                    particle.style.transform = `translate(${translateX}px, ${translateY}px)`;
                    particle.style.opacity = '0';
                }, 50);
            }, 10);

            // 动画结束后移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, (duration + 0.3) * 1000);
        }

        // 减少小型烟花爆炸数量，减轻性能压力
        setTimeout(() => {
            for (let j = 0; j < 3; j++) {
                const burstX = x + (Math.random() * 50 - 25);
                const burstY = y + (Math.random() * 50 - 25);
                this.createMiniFirework(burstX, burstY, color, size * 0.7, duration * 0.8);
            }
        }, duration * 300);
    }

    // 创建小型烟花爆炸
    createMiniFirework(x, y, color, size, duration) {
        const particleCount = 15; // 减少小型爆炸的粒子数量以提高性能
        const particleColors = this.getFireworkColors(color);

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle-mini';
            particle.style.position = 'fixed';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = size + Math.random() * 2 + 'px'; // 略微减小粒子大小
            particle.style.height = size + Math.random() * 2 + 'px';
            particle.style.backgroundColor = particleColors[Math.floor(Math.random() * particleColors.length)];
            particle.style.borderRadius = '50%';
            particle.style.opacity = '0';
            particle.style.zIndex = '1000';
            particle.style.pointerEvents = 'none';

            document.body.appendChild(particle);

            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.5 - 0.25); // 略微减少随机性
            const distance = Math.random() * 60 + 25; // 略微减小运动距离（25-85px）

            setTimeout(() => {
                particle.style.transition = `opacity 0.05s ease-out`;
                particle.style.opacity = '1';

                setTimeout(() => {
                    // 使用transform代替left/top改变，提高动画性能
                    const translateX = Math.cos(angle) * distance;
                    const translateY = Math.sin(angle) * distance;
                    particle.style.transition = `transform ${duration}s ease-out, opacity ${duration}s ease-out`;
                    particle.style.transform = `translate(${translateX}px, ${translateY}px)`;
                    particle.style.opacity = '0';
                }, 30);
            }, 10);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, (duration + 0.2) * 1000);
        }
    }

    // 获取烟花颜色变体（主色及其相近颜色）
    getFireworkColors(baseColor) {
        // 定义每种主色的变体
        const colorVariants = {
            '#FF5722': ['#FF5722', '#FF8A65', '#FFAB91'], // 橙色
            '#E91E63': ['#E91E63', '#F06292', '#F8BBD9'], // 粉色
            '#9C27B0': ['#9C27B0', '#BA68C8', '#E1BEE7'], // 紫色
            '#673AB7': ['#673AB7', '#9575CD', '#C5CAE9'], // 深紫色
            '#3F51B5': ['#3F51B5', '#7986CB', '#C5CAE9'], // 靛蓝色
            '#2196F3': ['#2196F3', '#64B5F6', '#BBDEFB'], // 蓝色
            '#03A9F4': ['#03A9F4', '#4FC3F7', '#B3E5FC'], // 亮蓝色
            '#00BCD4': ['#00BCD4', '#4DD0E1', '#B2EBF2'], // 青色
            '#009688': ['#009688', '#4DB6AC', '#B2DFDB'], // 蓝绿色
            '#4CAF50': ['#4CAF50', '#81C784', '#C8E6C9'], // 绿色
            '#8BC34A': ['#8BC34A', '#AED581', '#DCEDC8'], // 浅绿色
            '#CDDC39': ['#CDDC39', '#DCE775', '#F0F4C3'], // 酸橙色
            '#FFEB3B': ['#FFEB3B', '#FFF176', '#FFF9C4'], // 黄色
            '#FFC107': ['#FFC107', '#FFD54F', '#FFF3E0'], // 琥珀色
            '#FF9800': ['#FF9800', '#FFB74D', '#FFE0B2']  // 橙色
        };

        return colorVariants[baseColor] || ['#FFFFFF', '#CCCCCC', '#999999']; // 默认颜色
    }

    // 显示关卡通关模态框
    showLevel1WinModal() {
        console.log('=== 显示通关模态框 ===');
        console.log('当前关卡:', this.level);

        const modal = document.getElementById('level1WinModal');
        // 根据当前关卡更新模态框标题和按钮文本
        const titleElement = modal.querySelector('h2');
        const descriptionElement = document.getElementById('levelCompleteMessage');
        let nextBtnTemp = document.getElementById('nextLevelBtn');

        // 定义所有关卡的名称
        const levelNames = {
            1: '耒（lěi）',
            2: '耜（sì）',
            3: '犁（lí）',
            4: '耕牛（gēng niú）',
            5: '耖（chào）',
            6: '磨耙（mó bà）',
            7: '秧弹（yāng dàn）',
            8: '耧车（lóu chē）',
            9: '稻麦藁包（dào mài gǎo bāo）',
            10: '秧马（yāng mǎ）'
        };

        // 动态设置描述文本
        descriptionElement.textContent = `通过第${this.level}关-${levelNames[this.level]}的考验`;
        
        // 根据关卡设置按钮
        if (this.level < 10) {
            nextBtnTemp.textContent = '下一关';
            nextBtnTemp.style.display = 'inline-block'; // 显示下一关按钮
        } else {
            nextBtnTemp.textContent = '重新开始';
            nextBtnTemp.style.display = 'inline-block'; // 显示重新开始按钮
        }

        modal.classList.add('show');

        // 修复：移除所有旧的事件监听器（通过克隆按钮）
        const restartBtn = document.getElementById('restartLevelBtn');
        const nextBtn = document.getElementById('nextLevelBtn');

        // 克隆按钮来移除所有旧的事件监听器
        const newRestartBtn = restartBtn.cloneNode(true);
        const newNextBtn = nextBtn.cloneNode(true);
        restartBtn.parentNode.replaceChild(newRestartBtn, restartBtn);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

        // 添加新的事件监听器
        document.getElementById('restartLevelBtn').addEventListener('click', () => {
            console.log('=== 点击了重新来按钮 ===');
            this.restartLevel();
        });

        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            console.log('=== 点击了下一关/重新开始按钮 ===');
            console.log('当前关卡:', this.level);

            if (this.level < 10) {
                console.log('调用 goToNextLevel()');
                this.goToNextLevel();
            } else {
                console.log('调用 reset()');
                this.reset();
            }
        });
    }

    // 重新开始当前关卡
    restartLevel() {
        document.getElementById('level1WinModal').classList.remove('show');

        // 保存当前关卡设置
        const currentLevel = this.level;

        // 重置游戏状态，但保留当前关卡设置
        this.gameRunning = false;
        this.gamePaused = false;
        this.levelCompleted = false;
        this.showLabels = true; // 显示底部固定标签
        cancelAnimationFrame(this.gameLoopId);

        this.board = this.createBoard();
        this.score = 0;
        this.comboCount = 0; // 重置连击计数
        // 不重置level，保留当前关卡设置
        this.lines = 0;
        this.dropInterval = 1000;
        this.currentPiece = null;
        this.nextPiece = null;
        
        // 更新分数显示
        this.updateScore();

        // 根据当前关卡重置对应关卡的数据
        if (currentLevel === 1) {
            this.level1Data.currentIndex = 0;
            this.level1Data.completed = [];
            this.level1Data.initDropOrders(); // 重新初始化随机掉落顺序
        } else if (currentLevel === 2) {
            this.level2Data.currentIndex = 0;
            this.level2Data.completed = [];
            this.level2Data.initDropOrders(); // 重新初始化随机掉落顺序
        } else if (currentLevel === 3) {
            this.level3Data.currentIndex = 0;
            this.level3Data.completed = [];
            this.level3Data.initDropOrders(); // 重新初始化随机掉落顺序
        } else if (currentLevel === 4) {
            this.level4Data.currentIndex = 0;
            this.level4Data.completed = [];
            this.level4Data.initDropOrders(); // 重新初始化随机掉落顺序
        } else if (currentLevel === 5) {
            this.level5Data.currentIndex = 0;
            this.level5Data.completed = [];
            this.level5Data.initDropOrders(); // 重新初始化随机掉落顺序
        } else if (currentLevel === 6) {
            this.level6Data.currentIndex = 0;
            this.level6Data.completed = [];
            this.level6Data.initDropOrders(); // 重新初始化随机掉落顺序
        } else if (currentLevel === 7) {
            this.level7Data.currentIndex = 0;
            this.level7Data.completed = [];
            this.level7Data.initDropOrders(); // 重新初始化随机掉落顺序
        } else if (currentLevel === 8) {
            this.level8Data.currentIndex = 0;
            this.level8Data.completed = [];
            this.level8Data.initDropOrders(); // 重新初始化随机掉落顺序
        } else if (currentLevel === 9) {
            this.level9Data.currentIndex = 0;
            this.level9Data.completed = [];
            this.level9Data.initDropOrders(); // 重新初始化随机掉落顺序
        } else if (currentLevel === 10) {
            this.level10Data.currentIndex = 0;
            this.level10Data.completed = [];
            this.level10Data.initDropOrders(); // 重新初始化随机掉落顺序
        }

        this.spawnNewPiece();
        this.draw();
        this.updateScore();

        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = '暂停';
        document.getElementById('gameOverModal').classList.remove('show');
        document.getElementById('winModal').classList.remove('show');
        document.getElementById('level1WinModal').classList.remove('show');

        // 开始游戏
        this.start();
    }

    // 进入下一关
    goToNextLevel() {
        console.log('=== 进入下一关 ===');
        console.log('当前关卡:', this.level);

        document.getElementById('level1WinModal').classList.remove('show');

        // 重置游戏状态
        this.gameRunning = false;
        this.gamePaused = false;
        this.levelCompleted = false;
        this.showLabels = true;
        cancelAnimationFrame(this.gameLoopId);

        // 清空完成数据，防止再次触发庆祝
        if (this.level === 1) {
            this.level1Data.completed = [];
        } else if (this.level === 2) {
            this.level2Data.completed = [];
        } else if (this.level === 3) {
            this.level3Data.completed = [];
        } else if (this.level === 4) {
            this.level4Data.completed = [];
        } else if (this.level === 5) {
            this.level5Data.completed = [];
        } else if (this.level === 6) {
            this.level6Data.completed = [];
        } else if (this.level === 7) {
            this.level7Data.completed = [];
        } else if (this.level === 8) {
            this.level8Data.completed = [];
        } else if (this.level === 9) {
            this.level9Data.completed = [];
        } else if (this.level === 10) {
            this.level10Data.completed = [];
        }

        this.board = this.createBoard();
        this.score = 0;
        this.lines = 0;
        this.dropInterval = 1000;
        this.currentPiece = null;
        this.nextPiece = null;

        // 根据当前关卡决定下一关
        if (this.level === 1) {
            console.log('从第1关切换到第2关');
            this.level = 2; // 从关卡1到关卡2
            // 重置关卡2数据
            this.level2Data.currentIndex = 0;
            this.level2Data.completed = [];
            this.level2Data.initDropOrders();
            console.log('第2关数据已重置，三元组数量:', this.level2Data.triples.length);
        } else if (this.level === 2) {
            console.log('从第2关切换到第3关');
            this.level = 3; // 从关卡2到关卡3
            // 重置关卡3数据
            this.level3Data.currentIndex = 0;
            this.level3Data.completed = [];
            this.level3Data.initDropOrders();
            console.log('第3关数据已重置，三元组数量:', this.level3Data.triples.length);
        } else if (this.level === 3) {
            console.log('从第3关切换到第4关');
            this.level = 4; // 从关卡3到关卡4
            // 重置关卡4数据
            this.level4Data.currentIndex = 0;
            this.level4Data.completed = [];
            this.level4Data.initDropOrders();
            console.log('第4关数据已重置，三元组数量:', this.level4Data.triples.length);
        } else if (this.level === 4) {
            console.log('从第4关切换到第5关');
            this.level = 5; // 从关卡4到关卡5
            // 重置关卡5数据
            this.level5Data.currentIndex = 0;
            this.level5Data.completed = [];
            this.level5Data.initDropOrders();
            console.log('第5关数据已重置，三元组数量:', this.level5Data.triples.length);
        } else if (this.level === 5) {
            console.log('从第5关切换到第6关');
            this.level = 6; // 从关卡5到关卡6
            // 重置关卡6数据
            this.level6Data.currentIndex = 0;
            this.level6Data.completed = [];
            this.level6Data.initDropOrders();
            console.log('第6关数据已重置，三元组数量:', this.level6Data.triples.length);
        } else if (this.level === 6) {
            console.log('从第6关切换到第7关');
            this.level = 7; // 从关卡6到关卡7
            // 重置关卡7数据
            this.level7Data.currentIndex = 0;
            this.level7Data.completed = [];
            this.level7Data.initDropOrders();
            console.log('第7关数据已重置，三元组数量:', this.level7Data.triples.length);
        } else if (this.level === 7) {
            console.log('从第7关切换到第8关');
            this.level = 8; // 从关卡7到关卡8
            // 重置关卡8数据
            this.level8Data.currentIndex = 0;
            this.level8Data.completed = [];
            this.level8Data.initDropOrders();
            console.log('第8关数据已重置，三元组数量:', this.level8Data.triples.length);
        } else if (this.level === 8) {
            console.log('从第8关切换到第9关');
            this.level = 9; // 从关卡8到关卡9
            // 重置关卡9数据
            this.level9Data.currentIndex = 0;
            this.level9Data.completed = [];
            this.level9Data.initDropOrders();
            console.log('第9关数据已重置，三元组数量:', this.level9Data.triples.length);
        } else if (this.level === 9) {
            console.log('从第9关切换到第10关');
            this.level = 10; // 从关卡9到关卡10
            // 重置关卡10数据
            this.level10Data.currentIndex = 0;
            this.level10Data.completed = [];
            this.level10Data.initDropOrders();
            console.log('第10关数据已重置，三元组数量:', this.level10Data.triples.length);
        }

        this.spawnNewPiece();
        this.draw();
        this.updateScore();

        // 开始新关卡
        this.start();
    }

    // 游戏结束
    gameOver() {
        this.gameRunning = false;
        cancelAnimationFrame(this.gameLoopId);

        this.playSound('gameOver');

        // 显示游戏结束模态框
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverModal').classList.add('show');

        // 按钮状态更新
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }

    // 庆祝机制已被移除，统一使用level1Win()方法处理所有关卡的通关庆祝

    // 创建粒子特效
    createParticles() {
        this.particles = [];
        const particleCount = 200;

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                radius: Math.random() * 5 + 2,
                color: this.getRandomColor(),
                speedX: (Math.random() - 0.5) * 10,
                speedY: (Math.random() - 0.5) * 10,
                life: 1,
                decay: Math.random() * 0.03 + 0.01
            });
        }

        // 启动粒子动画
        this.animateParticles();
    }

    // 粒子动画
    animateParticles() {
        if (!this.particles || this.particles.length === 0) return;

        // 清除之前的帧
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制游戏板和方块（保持背景）
        this.drawBoard();

        // 更新和绘制粒子
        let aliveParticles = 0;
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // 更新粒子位置
            p.x += p.speedX;
            p.y += p.speedY;

            // 应用重力
            p.speedY += 0.2;

            // 应用衰减
            p.life -= p.decay;

            if (p.life > 0) {
                aliveParticles++;
                // 绘制粒子
                this.ctx.globalAlpha = p.life;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            }
        }

        // 重置透明度
        this.ctx.globalAlpha = 1;

        // 重新绘制庆祝信息
        this.showCelebrationMessage();

        // 继续动画
        if (aliveParticles > 0) {
            requestAnimationFrame(() => this.animateParticles());
        }
    }

    // 显示庆祝信息
    showCelebrationMessage() {
        // 创建半透明背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 显示庆祝文字
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // 添加文字阴影效果
        this.ctx.shadowColor = '#ffcc00';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        this.ctx.fillText('恭喜你！', this.canvas.width / 2, this.canvas.height / 2 - 40);

        // 根据当前关卡显示不同的庆祝信息
        if (this.level === 1) {
            this.ctx.fillText('通过关卡 1：耒（lěi）的考验~', this.canvas.width / 2, this.canvas.height / 2);
        } else if (this.level === 2) {
            this.ctx.fillText('通过关卡 2：耜（sì）的考验~', this.canvas.width / 2, this.canvas.height / 2);
        }

        // 重置阴影设置
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // 显示继续提示
        this.ctx.font = '16px Arial';
        this.ctx.fillText('按"重新开始"按钮开始新游戏', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    // 获取随机颜色（用于粒子特效）
    getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// === 关卡数据定义（按用户提供的 1-6 关配置） ===
const ELS_LEVEL_TRIPLES = {
    1: [
        { object: '耒（lěi）', feature: '萌芽期', value: '新石器时代早期' },
        { object: '耒（lěi）', feature: '衰退期', value: '商周以后' },
        { object: '耒（lěi）', feature: '材质', value: '木/骨/石(早期)、青铜/铁质（后期）' },
        { object: '耒（lěi）', feature: '适用土壤', value: '松软土壤' },
        { object: '耒（lěi）', feature: '效率', value: '较低' },
        { object: '耒头', feature: '材质', value: '木/骨/石(早期)、青铜/铁质（后期）' },
        { object: '耒头', feature: '形状', value: '锥形、扁平板状' },
        { object: '耒头', feature: '功能', value: '初步松动土层' },
        { object: '耒柄', feature: '材质', value: '木质' },
        { object: '耒柄', feature: '长度', value: '约等于人身高' },
        { object: '耒柄', feature: '形状', value: '长直杆且上端有自然弯曲' }
    ],
    2: [
        { object: '耜（sì）', feature: '萌芽期', value: '新石器时代中晚期' },
        { object: '耜（sì）', feature: '衰退期', value: '商周以后' },
        { object: '耜（sì）', feature: '材质', value: '石/骨/木(新石器时代)、青铜(商周)、铁质(春秋后)' },
        { object: '耜（sì）', feature: '核心功能', value: '铲土、翻土' },
        { object: '耜（sì）', feature: '操作方式', value: '手持并用脚踏与肩部发力' },
        { object: '耜（sì）', feature: '效率', value: '高于耒' },
        { object: '耜头', feature: '材质', value: '石/骨/木（早期）、青铜/铁质（后期）' },
        { object: '耜头', feature: '形状', value: '扁平板状刃部且有肩或穿孔' },
        { object: '耜头', feature: '功能', value: '切入土壤、抬起土块翻土' },
        { object: '耜头', feature: '面积', value: '较大' },
        { object: '耜柄', feature: '材质', value: '木质' },
        { object: '耜柄', feature: '形状', value: '直杆' },
        { object: '耜柄', feature: '长度', value: '长于人身高' },
        { object: '耜头', feature: '功能', value: '传递人力、形成杠杆、提供握持点' },
        { object: '踏肩/踏脚处', feature: '功能', value: '提供稳固的脚踏点' },
        { object: '踏肩/踏脚处', feature: '位置', value: '位于耜身下部，靠近耜头连接处' }
    ],
    3: [
        { object: '犁（lí）', feature: '萌芽期', value: '商周时期' },
        { object: '犁（lí）', feature: '衰退期', value: '20世纪中后期' },
        { object: '犁（lí）', feature: '材质', value: '铁质、木质' },
        { object: '犁（lí）', feature: '核心动力', value: '人力、畜力' },
        { object: '犁（lí）', feature: '用途', value: '翻耕土地' },
        { object: '犁（lí）', feature: '效率', value: '极高' },
        { object: '犁铧', feature: '材质', value: '铁质' },
        { object: '犁铧', feature: '外形特点', value: '等边或等腰三角形且中空呈“V”形' },
        { object: '犁铧', feature: '核心功能', value: '切开土块并引导土垡上升' },
        { object: '犁壁', feature: '材质', value: '铁质' },
        { object: '犁壁', feature: '核心功能', value: '翻转和破碎土垡' },
        { object: '犁辕', feature: '材质', value: '木质' },
        { object: '犁辕', feature: '形状', value: '长杆（早期为直辕，唐代后普及曲辕）' },
        { object: '犁辕', feature: '长度', value: '远长于耒耜之柄' },
        { object: '犁辕', feature: '核心功能', value: '传递牵引力' },
        { object: '犁箭', feature: '核心功能', value: '调节耕深' }
    ],
    4: [
        { object: '耕牛（gēng niú）', feature: '体型', value: '大' },
        { object: '耕牛（gēng niú）', feature: '体重', value: '[300-800]kg' },
        { object: '耕牛（gēng niú）', feature: '寿命', value: '较长（约15-20年）' },
        { object: '耕牛（gēng niú）', feature: '品种', value: '黄牛、水牛、牦牛…' },
        { object: '耕牛（gēng niú）', feature: '食性', value: '草料、谷物…' },
        { object: '耕牛（gēng niú）', feature: '生理特性', value: '反刍动物、可驯化、驾驭、繁殖…' },
        { object: '耕牛（gēng niú）', feature: '性格特征', value: '性情相对温顺' },
        { object: '耕牛（gēng niú）', feature: '核心功能', value: '提供持续且强大的牵引力' },
        { object: '耕牛（gēng niú）', feature: '牵引力', value: '约等于其体重的10％-15％' },
        { object: '耕牛（gēng niú）', feature: '状态要求', value: '健康、驯服' },
        { object: '耕牛（gēng niú）', feature: '系统贡献', value: '成倍提升耕作效率与规模（日耕3-5亩）' },
        { object: '耕牛（gēng niú）', feature: '经济价值', value: '高' },
        { object: '躯干', feature: '生理特征', value: '强壮的肌肉、厚重的骨骼' },
        { object: '躯干', feature: '功能', value: '将生物能转化为机械牵引力' },
        { object: '蹄足', feature: '生理特征', value: '蹄壳坚硬、四肢稳健' },
        { object: '蹄足', feature: '功能', value: '提供抓地力和推进力' }
    ],
    5: [
        { object: '耖（chào）', feature: '萌芽期', value: '唐代或更早（随江东曲辕犁体系出现）' },
        { object: '耖（chào）', feature: '普及应用期', value: '宋元以后' },
        { object: '耖（chào）', feature: '核心应用期', value: '明清' },
        { object: '耖（chào）', feature: '动力源', value: '畜力' },
        { object: '耖（chào）', feature: '材质', value: '竹质（早期）、铁（后期）' },
        { object: '耖（chào）', feature: '核心结构', value: '方形或“而”字形木架、下装一系列直列齿' },
        { object: '耖（chào）', feature: '核心功能', value: '碎土平田、搅匀泥水' },
        { object: '耖（chào）', feature: '使用场景', value: '水田（犁耕后，插秧前）' },
        { object: '耖（chào）', feature: '操作方式', value: '牛力牵引与人力控制' },
        { object: '耖齿', feature: '材质', value: '木、竹、铁' },
        { object: '耖齿', feature: '形状', value: '长直齿且下端尖锐' },
        { object: '耖齿', feature: '排列方式', value: '等距平行排列' },
        { object: '耖框', feature: '材质', value: '木质' },
        { object: '耖框', feature: '形状', value: '方形或“而”字形框架' },
        { object: '耖框', feature: '结构特性', value: '坚固且有一定宽度' },
        { object: '耖辕/牵引杆', feature: '结构', value: '两根平行的长辕' },
        { object: '耖辕/牵引杆', feature: '核心功能', value: '传递牵引力并作为扶手的支撑' }
    ],
    6: [
        { object: '磨耙（mó bà）', feature: '萌芽期', value: '汉代' },
        { object: '磨耙（mó bà）', feature: '动力源', value: '畜力' },
        { object: '磨耙（mó bà）', feature: '材质', value: '铁质、木质' },
        { object: '磨耙（mó bà）', feature: '核心结构', value: '长条形平板或粗木段（无齿）' },
        { object: '磨耙（mó bà）', feature: '核心功能', value: '破碎土块、平田面、压实秧床、清除杂草、拌匀泥水' },
        { object: '磨耙（mó bà）', feature: '效率', value: '低于耖且适用于小地块' }
    ]
};

// === 统一关卡完成逻辑重构（通过原型覆盖） ===
// 使用原型覆盖的方式，为已有类方法增加统一的关卡完成检测逻辑，
// 避免在庞大的类定义内部做大规模修改，降低风险。

// 保存原始方法引用（用于必要时回退）
const _originalUpdateTripleCompletion = TetrisGame.prototype.updateTripleCompletion;
const _originalGameLoop = TetrisGame.prototype.gameLoop;

// 通用关卡完成检测
TetrisGame.prototype.checkLevelCompletion = function () {
    // 已经标记完成则直接返回
    if (this.levelCompleted) {
        return;
    }

    const levelData = this.getCurrentLevelConfig ? this.getCurrentLevelConfig() : null;
    if (!levelData || !Array.isArray(levelData.completed)) {
        return;
    }

    // 使用 originalTriples 作为关卡三元组总数的基准
    const totalTriples = Array.isArray(levelData.originalTriples)
        ? levelData.originalTriples.length
        : (Array.isArray(levelData.triples) ? levelData.triples.length : 0);

    if (!totalTriples) {
        return;
    }

    const completedTriplesCount = levelData.completed.filter(t => t.object && t.feature && t.value).length;

    // 调试输出（保留原来类似的日志语义）
    try {
        console.log(`关卡 ${this.level} - 完成三元组数量: ${completedTriplesCount}/${totalTriples}`);
    } catch (e) {
        // 控制台不可用时忽略
    }

    if (completedTriplesCount === totalTriples && !this.levelCompleted) {
        this.levelCompleted = true;
        // 将当前关卡添加到已完成列表
        if (!this.completedLevels.includes(this.level)) {
            this.completedLevels.push(this.level);
        }
        // 更新关卡选择界面
        this.updateLevelSelectUI();
        this.level1Win();
    }
};

// 覆盖三元组完成更新逻辑，统一走 checkLevelCompletion
TetrisGame.prototype.updateTripleCompletion = function (tripleIndex, moduleType) {
    const levelData = this.getCurrentLevelConfig ? this.getCurrentLevelConfig() : null;

    // 如果无法获取当前关卡配置，则回退到原始实现（安全兜底）
    if (!levelData || !Array.isArray(levelData.completed)) {
        if (typeof _originalUpdateTripleCompletion === 'function') {
            return _originalUpdateTripleCompletion.call(this, tripleIndex, moduleType);
        }
        return;
    }

    // 查找或创建该三元组的完成状态记录
    let tripleStatus = levelData.completed.find(t => t.index === tripleIndex);
    if (!tripleStatus) {
        tripleStatus = {
            index: tripleIndex,
            object: false,
            feature: false,
            value: false
        };
        levelData.completed.push(tripleStatus);
    }

    // 更新对应模块类型的完成状态
    tripleStatus[moduleType] = true;

    // 单个三元组完成时，可以输出提示（保持轻量）
    if (tripleStatus.object && tripleStatus.feature && tripleStatus.value) {
        try {
            console.log(`三元组 ${tripleIndex + 1} 已完成！`);
        } catch (e) {
            // 控制台不可用时忽略
        }
    }

    // 统一进行关卡完成检测
    if (typeof this.checkLevelCompletion === 'function') {
        this.checkLevelCompletion();
    }
};

// 覆盖游戏主循环，使用统一的关卡完成检测逻辑
TetrisGame.prototype.gameLoop = function (timestamp) {
    if (!this.gameRunning) return;

    // 只有在游戏未暂停时才执行自动下降
    if (!this.gamePaused) {
        if (!timestamp) timestamp = 0;

        if (timestamp - this.lastDropTime > this.dropInterval) {
            this.move(0, 1);
            this.lastDropTime = timestamp;
        }
    }

    // 统一关卡完成检测
    if (typeof this.checkLevelCompletion === 'function') {
        this.checkLevelCompletion();
    }

    this.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
};

// 游戏结束后重新开始
document.getElementById('playAgainBtn').addEventListener('click', () => {
    document.getElementById('gameOverModal').style.display = 'none';
    tetrisGame.reset();
    tetrisGame.start();
});

// 初始化游戏
let tetrisGame;

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    tetrisGame = new TetrisGame();
});
