let CHARS = ' .,\'"\\:;\\-=_|＼／<>';

function main() {
    let s = document.getElementById('input').value;
    escapeToUnicode(s);
    clipboard(s);
    checkByteCount(s);
}

function escapeToUnicode() {
    let r = /[　 \n][　 ]{3}[　 \n]/;
    while (r.test(s)) {
        s = avoid(s, r);
    }

    r = RegExp(`[${CHARS}\n][${CHARS}]{3}[${CHARS}\n]`);
    while (r.test(s)) {
        s = avoid(s, r);
    }

    console.log(s)

    function avoid(s, r) {
        return s.replace(r, (sub) => {
            // 最後の1文字を数値参照化
            // 最後の1文字が改行の場合は最後から2文字目を数値参照化する
            if (sub.slice(-1) === '\n') {
                return sub.slice(0, -2) + toEntity(sub.slice(-2, -1)) + '\n';
            } else {
                return sub.slice(0, -1) + toEntity(sub.slice(-1));
            }
        });
    }

    function toEntity(c) {
        return '&#' + c.charCodeAt() + ';';
    }
}

function clipboard(s) {
    const tempElement = document.createElement('textarea');
    tempElement.style = "position: absolute; left: -9999px; top: -9999px";
    tempElement.value = s;
    document.body.appendChild(tempElement);
    tempElement.select();
    document.execCommand('copy');
    document.body.removeChild(tempElement);

    const result = document.getElementById('result');
    result.textContent = 'クリップボードにコピーされました';
    result.className = '';
}

function checkByteCount(s) {
    // バイト数チェック
    // （出力ではされなくとも）HTMLエスケープされてからチェックにかけられる
    // UTF-8ではなくShift_JISでカウントされる

    s
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .split('\n')
        .some((s, i) => {
            let bytes = 0;
            for (let c of s) {
                let code = c.charCodeAt();
                if ((code >= 0x0 && code < 0x81) || (code >= 0xff61 && code < 0xffa0) || (code >= 0xf8f0 && code < 0xf8f4)) {
                    bytes += 1;
                } else {
                    bytes += 2;
                }
            }
            if (bytes >= 256) {
                const overflowedRowNum = i + 1;
                const overflowBytes = bytes - 255;

                result.textContent = `${overflowedRowNum}行目が${overflowBytes}バイト超過 連続するスペースや半角記号を減らしてください`;
                result.className = 'error';

                return true;
            } else {
                return false;
            }
        });
}
