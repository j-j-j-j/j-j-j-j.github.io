function escapeToUnicode() {
    const input = document.getElementById('input').value;
    // NGワード判定は改行を' <br> 'に置換してから行っている
    let output = input.replace(/\n/g, ' <br> ')
                      .replace(/[　 ]{5,}/g, avoid)
                      .replace(/[ \.,'"\:;=_|]{5,}/g, avoid)
                      .replace(/( |&#32;)<br> /g, '\n');

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

    // バイト数チェック
    // HTMLエスケープされてからチェックにかけられることに留意
    let overflowedRow;
    let overflowedBytes = 0;
    output.replace(/&/g, '&amp;')
                               .replace(/"/g, '&quot;')
                               .replace(/</g, '&lt;')
                               .replace(/>/g, '&gt;')
                               .split('\n')
                               .some((s, i) => {
        const bytes = encodeURIComponent(s).replace(/%../g,"x").length;
        if (bytes > 256) {
            overflowedRow = i + 1;
            overflowBytes = bytes - 256;
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

