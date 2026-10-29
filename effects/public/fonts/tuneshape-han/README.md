# TuneShape Han

An interface subset of LXGW Neo XiHei 1.305, renamed **TuneShape Han**.
License: IPA Font License Agreement 1.0. Glyph outlines are unchanged.

- Upstream: https://github.com/lxgw/LxgwNeoXiHei/releases/tag/v1.305
- Full license: ../lxgw-neo-xihei/LICENSE.md
- Chinese translation: ../lxgw-neo-xihei/LICENSE_CHS.md
- Source and output checksums, covered codepoints: BUILD.json
- Generation: scripts/subset-font.py with scripts/font-requirements.txt

All upstream fonts remain in their original directories. To restore the
original program, download and install the unchanged **IPAexGothic 004.01**
from `../ipaex-gothic/ipaexg.ttf` or https://moji.or.jp/ipafont/ipaex00401/ ,
restart the browser and reload. The text font stack checks the installed
`IPAexGothic` family before `TuneShape Han`. This preserves restoration without
`local()` candidates that can leave unused WebKit font faces pending. No automatic download or
installation of the original font occurs.

The subset and full fallback have disjoint CSS unicode ranges. Text outside
the subset can still use the unchanged full LXGW Neo XiHei WOFF2. The build
ships both, together with the original TTF, IPA original and license files.
