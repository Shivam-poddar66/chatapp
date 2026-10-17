class MaskingService {
    /**
     * Masks email local part, preserves @ and domain.
     * Examples:
     * john.doe@example.com -> j******e@example.com
     * me@domain.com -> **@domain.com
     */
    static maskEmail(text) {
        if (!text || typeof text !== 'string') return '';
        const emailRegex = /([a-zA-Z0-9_.+-]+)@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g;
        return text.replace(emailRegex, (match, user, domain) => {
            if (user.length <= 2) {
                return `${'*'.repeat(user.length)}@${domain}`;
            }
            const first = user[0];
            const last = user[user.length - 1];
            const middle = '*'.repeat(user.length - 2);
            return `${first}${middle}${last}@${domain}`;
        });
    }

    /**
     * Masks phone numbers: keeps first 2 and last 2 digits, masks middle with *.
     * Handles spaces, dashes, parentheses, and international prefixes (+).
     * Examples:
     * 9876543210 -> 98******10
     * +91 98765 43210 -> +91 98******10
     * (555) 123-4567 -> 55******67
     */
    static maskPhone(text) {
        if (!text || typeof text !== 'string') return '';
        const phoneRegex = /(?:\+(\d{1,3})[\s-]?)?\(?(\d{2,4})\)?[\s.-]?(\d{3,4})[\s.-]?(\d{3,4})/g;

        return text.replace(phoneRegex, (match) => {
            const digitsOnly = match.replace(/\D/g, '');
            if (digitsOnly.length < 7) return match; // Skip numbers that are too short

            const trimmed = match.trim();
            const hasPlus = trimmed.startsWith('+');

            // If it starts with +country_code
            if (hasPlus) {
                // e.g. +91 98765 43210
                // Match country code prefix
                const prefixMatch = trimmed.match(/^\+(\d{1,3})\s*(.*)$/);
                if (prefixMatch) {
                    const countryCode = prefixMatch[1];
                    const nationalPart = prefixMatch[2].replace(/\D/g, '');
                    if (nationalPart.length >= 4) {
                        const firstTwo = nationalPart.slice(0, 2);
                        const lastTwo = nationalPart.slice(-2);
                        const maskedMid = '*'.repeat(nationalPart.length - 4);
                        return `+${countryCode} ${firstTwo}${maskedMid}${lastTwo}`;
                    }
                }
            }

            const prefix = digitsOnly.slice(0, 2);
            const suffix = digitsOnly.slice(-2);
            const maskedMiddle = '*'.repeat(digitsOnly.length - 4);

            return `${hasPlus ? '+' : ''}${prefix}${maskedMiddle}${suffix}`;
        });
    }

    /**
     * Pipeline sanitizer: Masks both emails and phone numbers.
     */
    static maskMessage(content) {
        if (!content || typeof content !== 'string') return '';
        let result = this.maskEmail(content);
        result = this.maskPhone(result);
        return result;
    }
}

module.exports = MaskingService;
