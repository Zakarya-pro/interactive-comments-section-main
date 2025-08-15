/**
 * Utility functions for the Interactive Comments Section
 */

// Utility functions
const Utils = {
    /**
     * Generate a unique ID for new comments/replies
     * @returns {number} Unique ID
     */
    generateId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    },

    /**
     * Format timestamp to relative time
     * @param {string|Date} timestamp - The timestamp to format
     * @returns {string} Formatted relative time
     */
    formatTimeAgo(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        if (diffInSeconds < 2419200) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
        if (diffInSeconds < 29030400) return `${Math.floor(diffInSeconds / 2419200)} months ago`;
        return `${Math.floor(diffInSeconds / 29030400)} years ago`;
    },

    /**
     * Sanitize HTML to prevent XSS attacks
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Show notification message
     * @param {string} message - Message to show
     * @param {string} type - Type of notification (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    },

    /**
     * Validate comment content
     * @param {string} content - Comment content to validate
     * @returns {Object} Validation result
     */
    validateComment(content) {
        const trimmed = content.trim();

        if (!trimmed) {
            return { isValid: false, message: 'Comment cannot be empty' };
        }

        if (trimmed.length < 3) {
            return { isValid: false, message: 'Comment must be at least 3 characters long' };
        }

        if (trimmed.length > 1000) {
            return { isValid: false, message: 'Comment cannot exceed 1000 characters' };
        }

        return { isValid: true, message: '' };
    },

    /**
     * Scroll element into view smoothly
     * @param {Element} element - Element to scroll to
     */
    scrollToElement(element) {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    },

    /**
     * Focus element with proper accessibility
     * @param {Element} element - Element to focus
     */
    focusElement(element) {
        if (element) {
            element.focus();
            // Add temporary focus ring for screen readers
            element.setAttribute('tabindex', '-1');
            element.addEventListener('blur', () => {
                element.removeAttribute('tabindex');
            }, { once: true });
        }
    },

    /**
     * Check if user is on mobile device
     * @returns {boolean} True if mobile device
     */
    isMobile() {
        return window.innerWidth < 768;
    },

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} event - Keyboard event
     * @param {Object} handlers - Object with key handlers
     */
    handleKeyboardNav(event, handlers) {
        const key = event.key;
        if (handlers[key]) {
            event.preventDefault();
            handlers[key](event);
        }
    },

    /**
     * Create DOM element with attributes and content
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string|Element|Array} content - Element content
     * @returns {Element} Created element
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);

        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        // Set content
        if (typeof content === 'string') {
            element.textContent = content;
        } else if (content instanceof Element) {
            element.appendChild(content);
        } else if (Array.isArray(content)) {
            content.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Element) {
                    element.appendChild(child);
                }
            });
        }

        return element;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
