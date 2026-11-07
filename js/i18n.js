/* ============================================================
   js/i18n.js — 首页多语言（仅 index.html 引入）
   ------------------------------------------------------------
   语言与地区判定（按访问者 IP 的国家/地区代码，ISO 3166-1 alpha-2）：
     JP                  → ja            日语
     KR / KP             → ko            韩语
     HK / MO             → yue-Hant-HK   繁体粤语（书面粤语）
     TW                  → zh-Hant-TW    繁体中文（台湾用语）
     CN                  → zh-CN         简体中文
     其余全部国家/地区    → en            英文（含 US/GB/CA/AU/NZ/IE/ZA 等英语国家）
   IP 判定失败（接口超时 / 被拦截 / 返回空）：
     依次读取 navigator.languages，映射到上表语言；仍无法映射则英文。
   触发方式：每次打开首页自动判定，无手动切换入口。
   ============================================================ */

'use strict';

(function () {
    const DEFAULT_LOCALE = 'en';
    const PROBE_TIMEOUT = 1000;   // 单个接口超时
    const PROBE_DEADLINE = 1600;  // 全部接口的总预算
    const SAFETY_DELAY = 2000;    // 兜底：超过此时长仍未出结果，按浏览器语言渲染

    // 国家/地区 → 语言。未列出的代码一律走英文。
    const COUNTRY_TO_LOCALE = {
        JP: 'ja',
        KR: 'ko',
        KP: 'ko',
        HK: 'yue-Hant-HK',
        MO: 'yue-Hant-HK',
        TW: 'zh-Hant-TW',
        CN: 'zh-CN'
    };

    // 三个免费、支持 CORS 的 IP 归属地接口，按顺序回退
    const PROBES = [
        { url: 'https://countries.dev/ip', read: d => d && d.countryCode },
        { url: 'https://ipwho.is/', read: d => d && d.success !== false && d.country_code },
        { url: 'https://get.geojs.io/v1/ip/country.json', read: d => d && d.country }
    ];

    const I18N = {
        /* ==================== 简体中文 ==================== */
        'zh-CN': {
            'meta.title': "Hoooooot's",
            'meta.description': '我是 Hoooooot。Student Filmmaker & Creator，通过影像与设计讲述故事。',
            'nav.store': '商店',
            'nav.dev': '开发',
            'nav.contact': '联系',
            'aria.hero': '首页',
            'aria.about': '关于',
            'aria.store': '商店',
            'aria.gallery': '作品集',
            'aria.timeline': '历程',
            'aria.tools': '实用工具',
            'aria.contact': '联系',
            'aria.videoGrid': 'B 站最新视频',
            'alt.hero': 'Hoooooot 背景图',
            'alt.wechat': '视频号',
            'alt.qr': '视频号二维码',
            'about.eyebrow': '关于',
            'about.statement': '用镜头捕捉真实，<br>用设计传递情绪。',
            'about.note': '持续探索视觉语言与叙事逻辑的结合。',
            'about.tag1': '剪辑',
            'about.tag2': '调色',
            'about.tag3': '设计',
            'about.tag4': '创意',
            'about.tag5': '故事',
            'store.eyebrow': '商店',
            'store.title': '自己做的，也能带走。',
            'store.lead': '明信片与调色预设，把看过的光留成可以寄出、可以调用的样子。',
            'store.name1': 'Hoooooot LUT Premium',
            'store.desc1': '23 款基于 Rec.709 的风格化 LUT，照片与视频通用。',
            'store.name2': '2027 明信片',
            'store.desc2': '15 款典藏套装，从东莞到中国香港，一起放大世界。',
            'store.name3': '豪华套装',
            'store.desc3': '明信片与 LUT 打包，九五折。',
            'store.cta': '前往商店',
            'store.note': '仅在中国大陆地区发售。',
            'gallery.eyebrow': '作品集',
            'gallery.title': '最新的几支片子。',
            'gallery.lead': '同步自 B 站，每次打开都是最新的。',
            'gallery.empty': '新片还在路上。',
            'gallery.emptyCta': '去 B 站看',
            'timeline.eyebrow': '历程',
            'timeline.title': '一步一步走到这里。',
            'timeline.desc2026': '独立创作阶段，搭建个人数字空间。',
            'timeline.desc2025': '深入探索影像制作与设计美学的边界。',
            'tools.eyebrow': '实用',
            'tools.title': '顺手的小工具。',
            'tools.lead': '都在浏览器里完成，不登录，也不上传任何数据。',
            'tools.name1': '打字练习',
            'tools.desc1': '短句、段落与长篇三种文本，实时统计速度与准确率。',
            'tools.name2': '连接测速',
            'tools.desc2': '用 50MB 样本测量你与本站之间的实际带宽和延迟。',
            'tools.name3': '调色板',
            'tools.desc3': 'HEX、RGB、HSL、CMYK 互转，支持屏幕取色与一键复制。',
            'tools.name4': 'LUT 转换器',
            'tools.desc4': '预览 .cube 与 LUT PNG，导出 Resolve、Premiere、Unity 等格式。',
            'contact.eyebrow': '联系',
            'contact.title': '聊聊你的想法。',
            'contact.lead': '合作、约拍，或只是打个招呼，都欢迎。',
            'contact.mailAria': '邮箱地址，可直接编辑',
            'footer.note': "Hoooooot's 数据库可能存储在美国加利福尼亚州、德国法兰克福、日本东京等地区的服务器上，并根据当地法律提供的保护进行维护。您所在国家或司法管辖区的法律可能不保护或不允许相同类型的言论或分发。Hoooooot's 不鼓励违反任何法律，并且不对任何违反此类法律的行为负责。"
        },

        /* ==================== 繁体中文（台湾） ==================== */
        'zh-Hant-TW': {
            'meta.title': "Hoooooot's",
            'meta.description': '我是 Hoooooot。學生影像創作者，透過影像與設計說故事。',
            'nav.store': '商店',
            'nav.dev': '開發',
            'nav.contact': '聯絡',
            'aria.hero': '首頁',
            'aria.about': '關於',
            'aria.store': '商店',
            'aria.gallery': '作品集',
            'aria.timeline': '歷程',
            'aria.tools': '實用工具',
            'aria.contact': '聯絡',
            'aria.videoGrid': 'B 站最新影片',
            'alt.hero': 'Hoooooot 背景圖',
            'alt.wechat': '微信影音號',
            'alt.qr': '微信影音號 QR code',
            'about.eyebrow': '關於',
            'about.statement': '用鏡頭捕捉真實，<br>用設計傳遞情緒。',
            'about.note': '持續探索視覺語言與敘事邏輯的結合。',
            'about.tag1': '剪輯',
            'about.tag2': '調色',
            'about.tag3': '設計',
            'about.tag4': '創意',
            'about.tag5': '故事',
            'store.eyebrow': '商店',
            'store.title': '自己做的，也能帶走。',
            'store.lead': '明信片與調色預設，把看過的光留成可以寄出、可以套用的樣子。',
            'store.name1': 'Hoooooot LUT Premium',
            'store.desc1': '23 款以 Rec.709 為基礎的風格化 LUT，照片與影片皆適用。',
            'store.name2': '2027 明信片',
            'store.desc2': '15 款典藏套裝，從東莞到中國香港，一起放大世界。',
            'store.name3': '豪華套組',
            'store.desc3': '明信片與 LUT 一起帶，九五折。',
            'store.cta': '前往商店',
            'store.note': '僅於中國大陸地區販售。',
            'gallery.eyebrow': '作品集',
            'gallery.title': '最新的幾支片子。',
            'gallery.lead': '同步自 B 站，每次打開都是最新的。',
            'gallery.empty': '新片還在路上。',
            'gallery.emptyCta': '去 B 站看',
            'timeline.eyebrow': '歷程',
            'timeline.title': '一步一步走到這裡。',
            'timeline.desc2026': '獨立創作階段，打造個人數位空間。',
            'timeline.desc2025': '深入探索影像製作與設計美學的邊界。',
            'tools.eyebrow': '實用',
            'tools.title': '順手的小工具。',
            'tools.lead': '都在瀏覽器裡完成，不用登入，也不上傳任何資料。',
            'tools.name1': '打字練習',
            'tools.desc1': '短句、段落與長篇三種文本，即時統計速度與正確率。',
            'tools.name2': '連線測試',
            'tools.desc2': '用 50MB 樣本測量你與本站之間的實際頻寬與延遲。',
            'tools.name3': '色票工具',
            'tools.desc3': 'HEX、RGB、HSL、CMYK 互轉，支援螢幕取色與一鍵複製。',
            'tools.name4': 'LUT 轉換器',
            'tools.desc4': '預覽 .cube 與 LUT PNG，匯出 Resolve、Premiere、Unity 等格式。',
            'contact.eyebrow': '聯絡',
            'contact.title': '聊聊你的想法。',
            'contact.lead': '合作、約拍，或只是打個招呼，都歡迎。',
            'contact.mailAria': '電子郵件地址，可直接編輯',
            'footer.note': "Hoooooot's 資料庫可能儲存在美國加州、德國法蘭克福、日本東京等地區的伺服器上，並依當地法律提供的保護進行維護。您所在國家或司法管轄區的法律可能不保護或不允許相同類型的言論或散布。Hoooooot's 不鼓勵違反任何法律，且不對任何違反此類法律的行為負責。"
        },

        /* ==================== 繁体粤语（书面粤语，中国香港 / 中国澳门） ==================== */
        'yue-Hant-HK': {
            'meta.title': "Hoooooot's",
            'meta.description': '我係 Hoooooot。學生影像創作者，用影像同設計講故事。',
            'nav.store': '店舖',
            'nav.dev': '開發',
            'nav.contact': '聯絡',
            'aria.hero': '首頁',
            'aria.about': '關於',
            'aria.store': '店舖',
            'aria.gallery': '作品集',
            'aria.timeline': '歷程',
            'aria.tools': '實用工具',
            'aria.contact': '聯絡',
            'aria.videoGrid': 'B 站最新影片',
            'alt.hero': 'Hoooooot 背景圖',
            'alt.wechat': '視頻號',
            'alt.qr': '視頻號二維碼',
            'about.eyebrow': '關於',
            'about.statement': '將真實收入鏡頭，<br>將情緒交俾設計。',
            'about.note': '持續探索視覺語言同敘事邏輯嘅結合。',
            'about.tag1': '剪接',
            'about.tag2': '調色',
            'about.tag3': '設計',
            'about.tag4': '創意',
            'about.tag5': '故事',
            'store.eyebrow': '店舖',
            'store.title': '自己整嘅，都可以帶走。',
            'store.lead': '明信片同調色預設，將睇過嘅光留成可以寄出、可以套用嘅模樣。',
            'store.name1': 'Hoooooot LUT Premium',
            'store.desc1': '23 款以 Rec.709 為基礎嘅風格化 LUT，相片同影片都用得。',
            'store.name2': '2027 明信片',
            'store.desc2': '15 款典藏套裝，由東莞到中國香港，一齊放大世界。',
            'store.name3': '豪華套裝',
            'store.desc3': '明信片同 LUT 一齊買，九五折。',
            'store.cta': '前往店舖',
            'store.note': '只限中國大陸地區發售。',
            'gallery.eyebrow': '作品集',
            'gallery.title': '最新嘅幾條片。',
            'gallery.lead': '同步自 B 站，每次打開都係最新嘅。',
            'gallery.empty': '新片仲未上。',
            'gallery.emptyCta': '去 B 站睇',
            'timeline.eyebrow': '歷程',
            'timeline.title': '一步一步行到呢度。',
            'timeline.desc2026': '獨立創作階段，搭建個人數碼空間。',
            'timeline.desc2025': '深入探索影像製作同設計美學嘅邊界。',
            'tools.eyebrow': '實用',
            'tools.title': '順手嘅小工具。',
            'tools.lead': '全部喺瀏覽器入面搞掂，唔使登入，亦唔會上載任何資料。',
            'tools.name1': '打字練習',
            'tools.desc1': '短句、段落同長篇三種文本，即時統計速度同準確率。',
            'tools.name2': '連接測速',
            'tools.desc2': '用 50MB 樣本量度你同本站之間嘅實際頻寬同延遲。',
            'tools.name3': '調色板',
            'tools.desc3': 'HEX、RGB、HSL、CMYK 互換，支援螢幕取色同一鍵複製。',
            'tools.name4': 'LUT 轉換器',
            'tools.desc4': '預覽 .cube 同 LUT PNG，匯出 Resolve、Premiere、Unity 等格式。',
            'contact.eyebrow': '聯絡',
            'contact.title': '講講你嘅想法。',
            'contact.lead': '合作、約拍，或者純粹打個招呼，都無任歡迎。',
            'contact.mailAria': '電郵地址，可以直接編輯',
            'footer.note': "Hoooooot's 資料庫可能存放喺美國加州、德國法蘭克福、日本東京等地區嘅伺服器，並按當地法律提供嘅保護維護。你所在國家或司法管轄區嘅法律，未必保障或者容許同類言論或發佈。Hoooooot's 唔鼓勵違反任何法律，亦唔會對任何違反此類法律嘅行為負責。"
        },

        /* ==================== 日本語 ==================== */
        ja: {
            'meta.title': "Hoooooot's",
            'meta.description': 'Hoooooot です。映像とデザインで物語を伝える、学生フィルムメーカー。',
            'nav.store': 'ストア',
            'nav.dev': '開発',
            'nav.contact': 'コンタクト',
            'aria.hero': 'ホーム',
            'aria.about': 'プロフィール',
            'aria.store': 'ストア',
            'aria.gallery': 'ギャラリー',
            'aria.timeline': '歩み',
            'aria.tools': 'ツール',
            'aria.contact': 'コンタクト',
            'aria.videoGrid': 'Bilibili の最新動画',
            'alt.hero': 'Hoooooot の背景画像',
            'alt.wechat': 'WeChat チャンネル',
            'alt.qr': 'WeChat チャンネルの QR コード',
            'about.eyebrow': '概要',
            'about.statement': 'リアルを、レンズで切り取る。<br>感情を、デザインで伝える。',
            'about.note': '視覚言語と物語の論理が出会う地点を探っています。',
            'about.tag1': '編集',
            'about.tag2': 'カラー',
            'about.tag3': 'デザイン',
            'about.tag4': 'アイデア',
            'about.tag5': 'ストーリー',
            'store.eyebrow': 'ストア',
            'store.title': 'つくったものを、手元に。',
            'store.lead': 'ポストカードとカラープリセット。見た光を、送る形にも使う形にも。',
            'store.name1': 'Hoooooot LUT Premium',
            'store.desc1': 'Rec.709 をベースにした 23 種のスタイル LUT。写真にも動画にも使えます。',
            'store.name2': '2027 ポストカード',
            'store.desc2': '15 枚のコレクション。東莞から中国香港まで、世界を広げます。',
            'store.name3': 'バンドル',
            'store.desc3': 'ポストカードと LUT のセット。5% オフ。',
            'store.cta': 'ストアを見る',
            'store.note': '中国本土限定での販売です。',
            'gallery.eyebrow': '作品集',
            'gallery.title': '最近の何本か。',
            'gallery.lead': 'Bilibili から同期。開くたびに最新です。',
            'gallery.empty': '新しい作品は準備中です。',
            'gallery.emptyCta': 'Bilibili で見る',
            'timeline.eyebrow': '歩み',
            'timeline.title': '一歩ずつ、ここまで。',
            'timeline.desc2026': '独立制作期。自分のデジタル空間を構築。',
            'timeline.desc2025': '映像制作とデザインの境界を探る。',
            'tools.eyebrow': 'ツール',
            'tools.title': '手の届く、小さな道具。',
            'tools.lead': 'すべてブラウザ内で完結。ログインも、アップロードもありません。',
            'tools.name1': 'タイピング練習',
            'tools.desc1': '短文・段落・長文の 3 モード。速度と正確率をリアルタイム表示。',
            'tools.name2': '接続テスト',
            'tools.desc2': '50MB のサンプルで、当サイトとの実効帯域と遅延を測定します。',
            'tools.name3': 'カラーパレット',
            'tools.desc3': 'HEX / RGB / HSL / CMYK を相互変換。スポイトとコピーに対応。',
            'tools.name4': 'LUT コンバーター',
            'tools.desc4': '.cube と LUT PNG をプレビューし、Resolve・Premiere・Unity などへ書き出し。',
            'contact.eyebrow': 'コンタクト',
            'contact.title': '話を聞かせてください。',
            'contact.lead': '協業、撮影依頼、ただの挨拶まで。',
            'contact.mailAria': 'メールアドレス（編集できます）',
            'footer.note': "Hoooooot's のデータベースは、米国カリフォルニア州、ドイツ・フランクフルト、日本・東京などの地域のサーバーに保存され、現地の法律が定める保護のもとで維持される場合があります。お住まいの国または司法管轄区の法律では、同種の表現や配布が保護されない、または認められない可能性があります。Hoooooot's は法律違反を推奨せず、そうした違反行為について責任を負いません。"
        },

        /* ==================== 한국어 ==================== */
        ko: {
            'meta.title': "Hoooooot's",
            'meta.description': 'Hoooooot입니다. 영상과 디자인으로 이야기를 전하는 학생 영화 제작자입니다.',
            'nav.store': '스토어',
            'nav.dev': '개발',
            'nav.contact': '연락',
            'aria.hero': '홈',
            'aria.about': '소개',
            'aria.store': '스토어',
            'aria.gallery': '갤러리',
            'aria.timeline': '여정',
            'aria.tools': '도구',
            'aria.contact': '연락',
            'aria.videoGrid': 'Bilibili 최신 영상',
            'alt.hero': 'Hoooooot 배경 이미지',
            'alt.wechat': 'WeChat 채널',
            'alt.qr': 'WeChat 채널 QR 코드',
            'about.eyebrow': '소개',
            'about.statement': '진실은 렌즈로,<br>감정은 디자인으로.',
            'about.note': '시각 언어와 서사의 접점을 계속 탐구합니다.',
            'about.tag1': '편집',
            'about.tag2': '컬러',
            'about.tag3': '디자인',
            'about.tag4': '아이디어',
            'about.tag5': '스토리',
            'store.eyebrow': '스토어',
            'store.title': '직접 만든 것을, 손에.',
            'store.lead': '엽서와 컬러 프리셋. 본 빛을 보낼 수 있는 형태로, 적용할 수 있는 형태로.',
            'store.name1': 'Hoooooot LUT Premium',
            'store.desc1': 'Rec.709 기반의 스타일 LUT 23종. 사진과 영상 모두 사용할 수 있습니다.',
            'store.name2': '2027 엽서',
            'store.desc2': '15종 컬렉션. 둥관에서 중국 홍콩까지, 세계를 확장합니다.',
            'store.name3': '번들',
            'store.desc3': '엽서와 LUT 세트, 5% 할인.',
            'store.cta': '스토어 가기',
            'store.note': '중국 본토에서만 판매합니다.',
            'gallery.eyebrow': '작업 모음',
            'gallery.title': '최근작 몇 편.',
            'gallery.lead': 'Bilibili에서 동기화. 열 때마다 최신입니다.',
            'gallery.empty': '새 영상은 준비 중입니다.',
            'gallery.emptyCta': 'Bilibili에서 보기',
            'timeline.eyebrow': '여정',
            'timeline.title': '한 걸음씩, 여기까지.',
            'timeline.desc2026': '독립 창작 단계, 개인 디지털 공간 구축.',
            'timeline.desc2025': '영상 제작과 디자인 미학의 경계를 탐구.',
            'tools.eyebrow': '도구',
            'tools.title': '손 닿는 작은 도구들.',
            'tools.lead': '모두 브라우저 안에서 끝납니다. 로그인도, 업로드도 없습니다.',
            'tools.name1': '타이핑 연습',
            'tools.desc1': '짧은 문장, 문단, 장문의 세 가지 텍스트. 속도와 정확도를 실시간으로.',
            'tools.name2': '연결 속도 측정',
            'tools.desc2': '50MB 샘플로 이 사이트와의 실제 대역폭과 지연을 측정합니다.',
            'tools.name3': '색상 팔레트',
            'tools.desc3': 'HEX, RGB, HSL, CMYK 상호 변환. 화면 스포이드와 복사 지원.',
            'tools.name4': 'LUT 변환기',
            'tools.desc4': '.cube와 LUT PNG를 미리 보고 Resolve, Premiere, Unity 등으로 내보냅니다.',
            'contact.eyebrow': '연락',
            'contact.title': '이야기를 들려주세요.',
            'contact.lead': '협업, 촬영 의뢰, 혹은 가벼운 인사까지.',
            'contact.mailAria': '이메일 주소, 편집 가능',
            'footer.note': "Hoooooot's의 데이터베이스는 미국 캘리포니아주, 독일 프랑크푸르트, 일본 도쿄 등 지역의 서버에 저장될 수 있으며, 해당 지역 법률이 제공하는 보호 아래 유지됩니다. 거주하시는 국가 또는 관할 지역의 법률은 같은 유형의 표현이나 배포를 보호하지 않거나 허용하지 않을 수 있습니다. Hoooooot's는 어떤 법률 위반도 권장하지 않으며, 그러한 위반 행위에 대해 책임지지 않습니다."
        },

        /* ==================== English（英语国家 + 其余全部地区 + 兜底） ==================== */
        en: {
            'meta.title': "Hoooooot's",
            'meta.description': "I'm Hoooooot. Student filmmaker and creator, telling stories through images and design.",
            'nav.store': 'Store',
            'nav.dev': 'Dev',
            'nav.contact': 'Contact',
            'aria.hero': 'Home',
            'aria.about': 'About',
            'aria.store': 'Store',
            'aria.gallery': 'Gallery',
            'aria.timeline': 'Timeline',
            'aria.tools': 'Tools',
            'aria.contact': 'Contact',
            'aria.videoGrid': 'Latest videos on Bilibili',
            'alt.hero': 'Hoooooot background',
            'alt.wechat': 'WeChat Channel',
            'alt.qr': 'WeChat Channel QR code',
            'about.eyebrow': 'About',
            'about.statement': 'Stories through images.<br>Emotion through design.',
            'about.note': 'Exploring where visual language meets narrative.',
            'about.tag1': 'Editing',
            'about.tag2': 'Color',
            'about.tag3': 'Design',
            'about.tag4': 'Ideas',
            'about.tag5': 'Story',
            'store.eyebrow': 'Store',
            'store.title': 'Things I made, out in the world.',
            'store.lead': 'Postcards and color presets — light you can mail, or apply.',
            'store.name1': 'Hoooooot LUT Premium',
            'store.desc1': '23 stylised LUTs built on Rec.709, for stills and video.',
            'store.name2': '2027 Postcards',
            'store.desc2': 'Fifteen cards, fifteen cities — enlarging the world.',
            'store.name3': 'The Bundle',
            'store.desc3': 'Postcards and LUTs together, five percent off.',
            'store.cta': 'Visit the store',
            'store.note': 'Available in mainland China only.',
            'gallery.eyebrow': 'Portfolio',
            'gallery.title': 'A few recent cuts.',
            'gallery.lead': 'Synced from Bilibili, fresh on every visit.',
            'gallery.empty': 'New work is on the way.',
            'gallery.emptyCta': 'Watch on Bilibili',
            'timeline.eyebrow': 'Timeline',
            'timeline.title': 'One step at a time.',
            'timeline.desc2026': 'Independent practice — building a personal digital space.',
            'timeline.desc2025': 'Exploring the edges of filmmaking and design.',
            'tools.eyebrow': 'Tools',
            'tools.title': 'Small tools, close at hand.',
            'tools.lead': 'Everything runs in your browser — no account, no uploads.',
            'tools.name1': 'Typing Practice',
            'tools.desc1': 'Three text lengths, with live speed and accuracy.',
            'tools.name2': 'Connection Test',
            'tools.desc2': 'Measures real bandwidth and latency with a 50 MB sample.',
            'tools.name3': 'Color Palette',
            'tools.desc3': 'HEX, RGB, HSL and CMYK, with an eye dropper and copy.',
            'tools.name4': 'LUT Converter',
            'tools.desc4': 'Preview .cube and LUT PNGs, then export for Resolve, Premiere, Unity and more.',
            'contact.eyebrow': 'Contact',
            'contact.title': "Let's talk.",
            'contact.lead': 'Collaboration, commissions, or just a hello.',
            'contact.mailAria': 'Email address, editable',
            'footer.note': "Hoooooot's databases may be stored on servers in California (United States), Frankfurt (Germany), Tokyo (Japan) and other regions, and maintained under the protections provided by local law. The laws of your country or jurisdiction may not protect or permit the same kinds of expression or distribution. Hoooooot's does not encourage breaking any law and is not responsible for any such violation."
        }
    };

    let settled = false;

    /* ---------- 1. 文案写入 ---------- */
    function applyLocale(locale) {
        const dict = I18N[locale] || I18N[DEFAULT_LOCALE];
        const html = document.documentElement;

        html.lang = locale;
        html.setAttribute('data-locale', locale);

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            const value = dict[el.getAttribute('data-i18n')];
            if (typeof value === 'string') el.textContent = value;
        });

        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            const value = dict[el.getAttribute('data-i18n-html')];
            if (typeof value === 'string') el.innerHTML = value;
        });

        document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
            const value = dict[el.getAttribute('data-i18n-aria')];
            if (typeof value === 'string') el.setAttribute('aria-label', value);
        });

        document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
            const value = dict[el.getAttribute('data-i18n-alt')];
            if (typeof value === 'string') el.setAttribute('alt', value);
        });

        document.title = dict['meta.title'];

        const desc = document.querySelector('meta[name="description"]');
        if (desc) desc.setAttribute('content', dict['meta.description']);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', dict['meta.description']);

        document.body.classList.remove('region-pending');
    }

    /* ---------- 2. 地区 → 语言 ---------- */
    function localeFromCountry(code) {
        if (!code) return null;
        return COUNTRY_TO_LOCALE[String(code).toUpperCase()] || DEFAULT_LOCALE;
    }

    /* ---------- 3. 浏览器语言 → 语言（IP 判定失败时使用） ---------- */
    function localeFromNavigator() {
        const list = (navigator.languages && navigator.languages.length)
            ? navigator.languages
            : [navigator.language];

        for (let i = 0; i < list.length; i++) {
            const tag = String(list[i] || '').toLowerCase();
            if (!tag) continue;

            if (tag.indexOf('yue') === 0 || tag.indexOf('zh-hk') !== -1 || tag.indexOf('zh-mo') !== -1) {
                return 'yue-Hant-HK';
            }
            if (tag.indexOf('ja') === 0) return 'ja';
            if (tag.indexOf('ko') === 0) return 'ko';
            if (tag.indexOf('zh') === 0) {
                if (tag.indexOf('hant') !== -1 || tag.indexOf('-tw') !== -1) return 'zh-Hant-TW';
                return 'zh-CN';
            }
            if (tag.indexOf('en') === 0) return 'en';
        }
        return DEFAULT_LOCALE;
    }

    /* ---------- 4. IP 归属地探测（多源顺序回退） ---------- */
    function fetchJSON(url, timeout) {
        return new Promise(function (resolve, reject) {
            const controller = new AbortController();
            const timer = window.setTimeout(function () {
                controller.abort();
            }, timeout);

            fetch(url, {
                signal: controller.signal,
                cache: 'no-store',
                credentials: 'omit',
                referrerPolicy: 'no-referrer'
            })
                .then(function (response) {
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    return response.json();
                })
                .then(function (data) {
                    window.clearTimeout(timer);
                    resolve(data);
                })
                .catch(function (error) {
                    window.clearTimeout(timer);
                    reject(error);
                });
        });
    }

    async function detectCountryCode(deadline) {
        for (let i = 0; i < PROBES.length; i++) {
            const remaining = deadline - Date.now();
            if (remaining < 350) return null;

            try {
                const data = await fetchJSON(PROBES[i].url, Math.min(PROBE_TIMEOUT, remaining));
                const code = PROBES[i].read(data);
                if (code && /^[A-Za-z]{2}$/.test(String(code).trim())) {
                    return String(code).trim().toUpperCase();
                }
            } catch (error) {
                // 该接口不可用，继续下一个
            }
        }
        return null;
    }

    /* ---------- 5. 渲染（只渲染一次，晚到的结果不再改写页面） ---------- */
    function settle(locale) {
        if (settled) return;
        settled = true;
        applyLocale(locale || DEFAULT_LOCALE);
    }

    async function init() {
        let locale = null;

        try {
            const code = await detectCountryCode(Date.now() + PROBE_DEADLINE);
            locale = localeFromCountry(code);
        } catch (error) {
            locale = null;
        }

        settle(locale || localeFromNavigator());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 兜底：接口全部卡住时，不把访客留在空白页
    window.setTimeout(function () {
        settle(localeFromNavigator());
    }, SAFETY_DELAY);

    // 顶栏是异步注入的，注入完成后再补一次文案（仅首页）
    document.addEventListener('chrome:ready', function () {
        if (settled) applyLocale(document.documentElement.lang);
    });
})();
