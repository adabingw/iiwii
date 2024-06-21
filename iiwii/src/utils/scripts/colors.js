/**
 * functions to handle colours
 */

// converts hex to rgb
export const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { 
        r: r == 0 ? 1 : r, 
        g: g == 0 ? 1 : g, 
        b: b == 0 ? 1 : b 
    };
}

// converts rgb to hex
export const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// calculates the luminance of an rgb
export const calculateLuminance = ({ r, g, b }) => {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// inverts the colours to be shown in light mode
export const adjustBrightnessToLight = (hex) => {
    const rgb = hexToRgb(hex);
    const luminance = calculateLuminance(rgb);

    if (luminance < 128) {
        const targetLuminance = 255; // A higher value closer to white (255)
        const scale = targetLuminance / (luminance != 0 ? luminance : 1);
        const newR = Math.min(255, Math.floor(rgb.r * scale));
        const newG = Math.min(255, Math.floor(rgb.g * scale));
        const newB = Math.min(255, Math.floor(rgb.b * scale));
        const newHex = rgbToHex(newR, newG, newB);
        return newHex;
    } else {
        return hex;
    }
}


// inverts the colours to be shown in dark mode
export const adjustBrightnessToDark = (hex) => {
    const rgb = hexToRgb(hex);
    const luminance = calculateLuminance(rgb);

    if (luminance > 128) {
        const targetLuminance = 50; // Adjust as needed
        const scale = targetLuminance / (luminance != 0 ? luminance : 1);
        const newR = Math.max(0, Math.floor(rgb.r * scale));
        const newG = Math.max(0, Math.floor(rgb.g * scale));
        const newB = Math.max(0, Math.floor(rgb.b * scale));
        const newHex = rgbToHex(newR, newG, newB);
        return newHex;
    } else {
        return hex;
    }
}
