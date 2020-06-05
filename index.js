function escapeToUnicode() {
    const input = document.getElementById('input').value;
    // NGワード判定は改行を' <br> 'に置換してから行っている
    let output = input.replace(/\n/g, ' <br> ')
                      .replace(/[　 ]{5,}/g, avoid)
                      .replace(/[ \.,'"\:;\-=_|]{5,}/g, avoid)
                      .replace(/ <br> /g, '\n')
                      .replace(/&#32;<br> /g, '&#10;');

    const tempElement = document.createElement('textarea');
    tempElement.style = "position: absolute; left: -9999px; top: -9999px";
    tempElement.value = output;
    document.body.appendChild(tempElement);
    tempElement.select();
    document.execCommand('copy');
    document.body.removeChild(tempElement);

    const result = document.getElementById('result');
    result.textContent = 'クリップボードにコピーされました';
    result.className = '';

    // 行数ごとのバイト数チェック
    // （出力ではされなくとも）HTMLエスケープされてからチェックにかけられる
    // UTF-8ではなくShift_JISでカウントされる
    let overflowedRow;
    let overflowedBytes = 0;
    output
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
                overflowedRow = i + 1;
                overflowBytes = bytes - 255;
                return true;
            } else {
                return false;
            }
        });
    if (overflowedRow) {
        result.textContent = `${overflowedRow}行目が${overflowBytes}バイト超過 連続するスペースや半角記号を減らしてください`;
        result.className = 'error';
    }

    function avoid(s) {
        return s.replace(/(?:^.|[^ \.\:;,'"=_|])?.{4}/g, (substr) => {
            return substr.slice(0, -1) + '&#' + substr.slice(-1).charCodeAt() + ';';
        });
    }

}

