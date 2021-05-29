//Convert a base64 data string to a URL to be used with images for eg
export const toObjectUrl = (b64Data, contentType) => {
    const byteChars = atob(b64Data);
    const byteNums = new Array(byteChars.length)
    for (let i = 0; i < byteNums.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNums);
    const blob = new Blob([byteArray], {type: contentType});
    const url = URL.createObjectURL(blob);
    return url;
}