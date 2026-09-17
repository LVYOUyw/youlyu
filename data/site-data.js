/* ============================================================
 * site-data.js — 站点内容数据（唯一需要维护的文件）
 * ------------------------------------------------------------
 * 发表新论文：在 publications 数组开头（或合适位置）添加一项即可：
 *
 *   {
 *     type: "conference",              // "conference" 或 "journal"
 *     venue: "EUROCRYPT",              // 会议/期刊简称（徽章文字）
 *     year: 2026,
 *     title: "Paper Title",
 *     link: "https://doi.org/...",     // 论文链接（DOI / OpenReview / ...）
 *     authors: [                       // 作者按顺序；link 可省略
 *       { name: "You Lyu" },
 *       { name: "Shengli Liu", link: "http://english.seiee.sjtu.edu.cn/english/detail/841_671.htm" }
 *     ],
 *     note: ""                         // 可选，标题下方小字（如期刊全名）
 *   }
 *
 * 说明：
 *  - linkLabel 可不填，会根据链接自动生成（doi.org→DOI，openreview→OpenReview，ieee→IEEE Xplore）
 *  - research / service 的文字、education 的 note 字段允许使用简单 HTML（如 <a>、<em>）
 *  - updated 会显示在页脚；用编辑器（edit.html）导出时会自动更新
 * ============================================================ */
const SITE_DATA = {
  "updated": "Sep 2026",
  "research": {
    "lead": "My research focuses on <em>public-key cryptography with provable security</em> — reducing the security of real-world protocols to well-studied mathematical hardness assumptions.",
    "sub": "In particular, I am interested in the design of key exchange protocols: authenticated key exchange (AKE), password-authenticated key exchange (PAKE), universal composability, and security against quantum adversaries.",
    "chips": [
      "Public-Key Cryptography",
      "Provable Security",
      "Authenticated Key Exchange",
      "PAKE",
      "UC Framework",
      "Post-Quantum Cryptography"
    ]
  },
  "publications": [
    {
      "type": "conference",
      "venue": "ASIACRYPT",
      "year": 2026,
      "title": "OAEP† Transform in the Post-Quantum World",
      "link": "https://eprint.iacr.org/2026/1951",
      "authors": [
        {
          "name": "You Lyu"
        },
        {
          "name": "Shengli Liu"
        },
        {
          "name": "Shuai Han"
        },
        {
          "name": "Bohang Chen"
        }
      ]
    },
    {
      "type": "conference",
      "venue": "ASIACRYPT",
      "year": 2026,
      "title": "Two-Round Threshold Signatures with Adaptive TS-UF-1 Security from MDDH",
      "authors": [
        {
          "name": "Wenzhong Li"
        },
        {
          "name": "Shengli Liu"
        },
        {
          "name": "You Lyu"
        }
      ],
      "link": "https://eprint.iacr.org/2026/1928"
    },
    {
      "type": "conference",
      "venue": "EUROCRYPT",
      "year": 2025,
      "title": "Hybrid Password Authentication Key Exchange in the UC Framework",
      "link": "https://doi.org/10.1007/978-3-031-91124-8_15",
      "authors": [
        {
          "name": "You Lyu"
        },
        {
          "name": "Shengli Liu",
          "link": "http://english.seiee.sjtu.edu.cn/english/detail/841_671.htm"
        }
      ]
    },
    {
      "type": "conference",
      "venue": "ASIACRYPT",
      "year": 2024,
      "title": "Efficient Asymmetric PAKE Compiler from KEM and AE",
      "link": "https://doi.org/10.1007/978-981-96-0935-2_2",
      "authors": [
        {
          "name": "You Lyu"
        },
        {
          "name": "Shengli Liu",
          "link": "http://english.seiee.sjtu.edu.cn/english/detail/841_671.htm"
        },
        {
          "name": "Shuai Han",
          "link": "https://dalenhan.github.io"
        }
      ]
    },
    {
      "type": "conference",
      "venue": "EUROCRYPT",
      "year": 2024,
      "title": "Universal Composable Password Authenticated Key Exchange for the Post-Quantum World",
      "link": "https://doi.org/10.1007/978-3-031-58754-2_5",
      "authors": [
        {
          "name": "You Lyu"
        },
        {
          "name": "Shengli Liu",
          "link": "http://english.seiee.sjtu.edu.cn/english/detail/841_671.htm"
        },
        {
          "name": "Shuai Han",
          "link": "https://dalenhan.github.io"
        }
      ]
    },
    {
      "type": "conference",
      "venue": "ESORICS",
      "year": 2023,
      "title": "Two-Message Authenticated Key Exchange from Public-Key Encryption",
      "link": "https://doi.org/10.1007/978-3-031-50594-2_21",
      "authors": [
        {
          "name": "You Lyu"
        },
        {
          "name": "Shengli Liu",
          "link": "http://english.seiee.sjtu.edu.cn/english/detail/841_671.htm"
        }
      ]
    },
    {
      "type": "conference",
      "venue": "ASIACRYPT",
      "year": 2022,
      "title": "Privacy-Preserving Authenticated Key Exchange in the Standard Model",
      "link": "https://doi.org/10.1007/978-3-031-22969-5_8",
      "authors": [
        {
          "name": "You Lyu"
        },
        {
          "name": "Shengli Liu",
          "link": "http://english.seiee.sjtu.edu.cn/english/detail/841_671.htm"
        },
        {
          "name": "Shuai Han",
          "link": "https://dalenhan.github.io"
        },
        {
          "name": "Dawu Gu"
        }
      ]
    },
    {
      "type": "conference",
      "venue": "ICLR",
      "year": 2022,
      "title": "Online Facility Location with Predictions",
      "link": "https://openreview.net/forum?id=DSQHjibtgKR",
      "authors": [
        {
          "name": "Shaofeng H.-C. Jiang"
        },
        {
          "name": "Erzhi Liu"
        },
        {
          "name": "You Lyu"
        },
        {
          "name": "Zhihao Gavin Tang"
        },
        {
          "name": "Yubo Zhang"
        }
      ]
    },
    {
      "type": "journal",
      "venue": "IEEE TMC",
      "year": 2023,
      "title": "Face-Based Authentication Using Computational Secure Sketch",
      "link": "https://ieeexplore.ieee.org/document/9895318",
      "note": "IEEE Transactions on Mobile Computing",
      "authors": [
        {
          "name": "Mingming Jiang",
          "link": "https://eringiang.github.io"
        },
        {
          "name": "Shengli Liu",
          "link": "http://english.seiee.sjtu.edu.cn/english/detail/841_671.htm"
        },
        {
          "name": "You Lyu"
        },
        {
          "name": "Yu Zhou"
        }
      ]
    }
  ],
  "education": [
    {
      "time": "Sep 2022 — Present",
      "degree": "Ph.D. in Computer Science",
      "org": "Shanghai Jiao Tong University",
      "orgLink": "http://en.sjtu.edu.cn/",
      "note": "Advisor: Prof. <a href=\"http://english.seiee.sjtu.edu.cn/english/detail/841_671.htm\" target=\"_blank\" rel=\"noopener\">Shengli Liu</a>"
    },
    {
      "time": "Sep 2018 — Jun 2022",
      "degree": "B.S. in Computer Science",
      "tag": "ACM Class",
      "tagLink": "https://en.zhiyuan.sjtu.edu.cn/en",
      "org": "Shanghai Jiao Tong University",
      "orgLink": "http://en.sjtu.edu.cn/",
      "note": "Thesis supervisor: Prof. <a href=\"http://english.seiee.sjtu.edu.cn/english/detail/841_671.htm\" target=\"_blank\" rel=\"noopener\">Shengli Liu</a>"
    }
  ],
  "teaching": [
    {
      "code": "CS7301",
      "name": "Modern Cryptographic Algorithms",
      "meta": "Teaching Assistant · Graduate · Spring 2024"
    },
    {
      "code": "MATH2203",
      "name": "Modern Algebras",
      "meta": "Teaching Assistant · Undergraduate · Autumn 2021, Autumn 2022"
    }
  ],
  "service": {
    "text": "I have served as an external reviewer for several cryptography conferences:",
    "items": [
      "EUROCRYPT",
      "ASIACRYPT",
      "ACISP",
      "ProvSec"
    ]
  }
};
