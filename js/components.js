/**
 * Component generators for the Interactive Comments Section
 */

const Components = {
    /**
 * Create a comment element
 * @param {Object} comment - Comment data
 * @param {Object} currentUser - Current user data
 * @param {boolean} isReply - Whether this is a reply
 * @returns {Element} Comment element
 */
    createComment(comment, currentUser, isReply = false) {
        const isCurrentUser = comment.user.username === currentUser.username;
        const commentClass = isReply ? 'comment comment--reply' : 'comment';

        const commentElement = Utils.createElement('article', {
            className: commentClass,
            'data-comment-id': comment.id,
            role: 'article',
            'aria-label': `Comment by ${comment.user.username}`
        });

        // Use unified responsive HTML structure
        commentElement.innerHTML = this.getCommentHTML(comment, currentUser, isCurrentUser);

        // Add event listeners
        this.attachCommentEventListeners(commentElement, comment, currentUser, isCurrentUser);

        return commentElement;
    },

    /**
 * Get unified responsive comment HTML structure
 * @param {Object} comment - Comment data
 * @param {Object} currentUser - Current user data
 * @param {boolean} isCurrentUser - Whether comment is by current user
 * @returns {string} HTML string
 */
    getCommentHTML(comment, currentUser, isCurrentUser) {
        const replyToText = comment.replyingTo ? `<span class="reply-to">@${comment.replyingTo}</span> ` : '';
        const userBadge = isCurrentUser ? '<span class="user-badge">you</span>' : '';

        return `
      <div class="voting">
        <button type="button" class="voting__button" aria-label="Upvote comment" data-action="upvote">
          <img src="./images/icon-plus.svg" alt="" aria-hidden="true">
        </button>
        <span class="voting__score" aria-label="Score: ${comment.score}">${comment.score}</span>
        <button type="button" class="voting__button" aria-label="Downvote comment" data-action="downvote">
          <img src="./images/icon-minus.svg" alt="" aria-hidden="true">
        </button>
      </div>
      
      <div class="comment__main">
        <header class="comment__header">
          <div class="user-info">
            <img src="${comment.user.image.webp || comment.user.image.png}" 
                 alt="${comment.user.username}'s avatar" 
                 class="avatar"
                 width="32" 
                 height="32">
            <span class="username ${isCurrentUser ? 'username--current' : ''}">${comment.user.username}</span>
            ${userBadge}
            <span class="timestamp">${Utils.formatTimeAgo(comment.createdAt)}</span>
          </div>
          
          <div class="comment__actions">
            ${this.getActionButtons(isCurrentUser)}
          </div>
        </header>
        
        <div class="comment__content">
          ${replyToText}${Utils.sanitizeHtml(comment.content)}
        </div>
        
        <footer class="comment__footer comment__footer--mobile">
          <div class="voting voting--mobile">
            <button type="button" class="voting__button" aria-label="Upvote comment" data-action="upvote">
              <img src="./images/icon-plus.svg" alt="" aria-hidden="true">
            </button>
            <span class="voting__score" aria-label="Score: ${comment.score}">${comment.score}</span>
            <button type="button" class="voting__button" aria-label="Downvote comment" data-action="downvote">
              <img src="./images/icon-minus.svg" alt="" aria-hidden="true">
            </button>
          </div>
          
          <div class="comment__actions comment__actions--mobile">
            ${this.getActionButtons(isCurrentUser)}
          </div>
        </footer>
      </div>
    `;
    },



    /**
     * Get action buttons HTML
     * @param {boolean} isCurrentUser - Whether comment is by current user
     * @returns {string} HTML string
     */
    getActionButtons(isCurrentUser) {
        if (isCurrentUser) {
            return `
        <button type="button" class="btn btn--text btn--danger" data-action="delete" aria-label="Delete comment">
          <img src="./images/icon-delete.svg" alt="" aria-hidden="true">
          Delete
        </button>
        <button type="button" class="btn btn--text" data-action="edit" aria-label="Edit comment">
          <img src="./images/icon-edit.svg" alt="" aria-hidden="true">
          Edit
        </button>
      `;
        } else {
            return `
        <button type="button" class="btn btn--text" data-action="reply" aria-label="Reply to comment">
          <img src="./images/icon-reply.svg" alt="" aria-hidden="true">
          Reply
        </button>
      `;
        }
    },

    /**
     * Create reply form
     * @param {Object} currentUser - Current user data
     * @param {string} replyingTo - Username being replied to
     * @param {number} parentId - Parent comment ID
     * @returns {Element} Reply form element
     */
    createReplyForm(currentUser, replyingTo, parentId) {
        const formElement = Utils.createElement('form', {
            className: 'comment-form comment-form--reply',
            'data-parent-id': parentId,
            'data-replying-to': replyingTo,
            'aria-label': `Reply to ${replyingTo}`
        });

        formElement.innerHTML = `
      <div class="comment-form__avatar">
        <img src="${currentUser.image.webp || currentUser.image.png}" 
             alt="Your avatar" 
             class="avatar avatar--large"
             width="40" 
             height="40">
      </div>
      
      <div class="comment-form__input">
        <label for="reply-text-${parentId}" class="sr-only">Reply to ${replyingTo}</label>
        <textarea 
          id="reply-text-${parentId}"
          name="reply"
          placeholder="Add a reply..."
          rows="3"
          required
          class="comment-textarea"
          aria-describedby="reply-help-${parentId}">@${replyingTo} </textarea>
        <div id="reply-help-${parentId}" class="sr-only">Enter your reply and click Reply to post it</div>
      </div>
      
      <div class="comment-form__actions">
        <button type="button" class="btn btn--secondary" data-action="cancel">Cancel</button>
        <button type="submit" class="btn btn--primary">Reply</button>
      </div>
    `;

        // Attach event listeners
        this.attachReplyFormEventListeners(formElement);

        return formElement;
    },

    /**
     * Create edit form
     * @param {Object} comment - Comment being edited
     * @returns {Element} Edit form element
     */
    createEditForm(comment) {
        const formElement = Utils.createElement('form', {
            className: 'edit-form',
            'data-comment-id': comment.id,
            'aria-label': 'Edit comment'
        });

        formElement.innerHTML = `
      <div class="edit-form__input">
        <label for="edit-text-${comment.id}" class="sr-only">Edit your comment</label>
        <textarea 
          id="edit-text-${comment.id}"
          name="content"
          rows="3"
          required
          class="comment-textarea"
          aria-describedby="edit-help-${comment.id}">${comment.content}</textarea>
        <div id="edit-help-${comment.id}" class="sr-only">Edit your comment and click Update to save changes</div>
      </div>
      
      <div class="edit-form__actions">
        <button type="button" class="btn btn--secondary" data-action="cancel">Cancel</button>
        <button type="submit" class="btn btn--primary">Update</button>
      </div>
    `;

        // Attach event listeners
        this.attachEditFormEventListeners(formElement);

        return formElement;
    },

    /**
     * Create replies container
     * @param {Array} replies - Array of reply objects
     * @param {Object} currentUser - Current user data
     * @returns {Element} Replies container element
     */
    createRepliesContainer(replies, currentUser) {
        const repliesContainer = Utils.createElement('div', {
            className: 'replies',
            'aria-label': 'Replies'
        });

        replies.forEach(reply => {
            const replyElement = this.createComment(reply, currentUser, true);
            repliesContainer.appendChild(replyElement);
        });

        return repliesContainer;
    },

    /**
     * Attach event listeners to comment
     * @param {Element} commentElement - Comment element
     * @param {Object} comment - Comment data
     * @param {Object} currentUser - Current user data
     * @param {boolean} isCurrentUser - Whether comment is by current user
     */
    attachCommentEventListeners(commentElement, comment, currentUser, isCurrentUser) {
        // Voting buttons
        const votingButtons = commentElement.querySelectorAll('.voting__button');
        votingButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleVoting(comment.id, action);
            });
        });

        // Action buttons
        const actionButtons = commentElement.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
            const action = button.dataset.action;
            if (action !== 'upvote' && action !== 'downvote') {
                button.addEventListener('click', (e) => {
                    this.handleCommentAction(e, comment, currentUser);
                });
            }
        });

        // Keyboard navigation
        commentElement.addEventListener('keydown', (e) => {
            Utils.handleKeyboardNav(e, {
                'Enter': () => {
                    if (e.target.matches('.voting__button')) {
                        e.target.click();
                    }
                },
                ' ': () => {
                    if (e.target.matches('.voting__button')) {
                        e.target.click();
                    }
                }
            });
        });
    },

    /**
     * Attach event listeners to reply form
     * @param {Element} formElement - Reply form element
     */
    attachReplyFormEventListeners(formElement) {
        const textarea = formElement.querySelector('textarea');
        const cancelButton = formElement.querySelector('[data-action="cancel"]');

        // Form submission
        formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleReplySubmit(formElement);
        });

        // Cancel button
        cancelButton.addEventListener('click', () => {
            this.cancelReply(formElement);
        });

        // Auto-focus textarea
        setTimeout(() => {
            textarea.focus();
            // Position cursor after @username
            const atIndex = textarea.value.indexOf(' ') + 1;
            textarea.setSelectionRange(atIndex, atIndex);
        }, 100);

        // Keyboard shortcuts
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cancelReply(formElement);
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                formElement.dispatchEvent(new Event('submit'));
            }
        });
    },

    /**
     * Attach event listeners to edit form
     * @param {Element} formElement - Edit form element
     */
    attachEditFormEventListeners(formElement) {
        const textarea = formElement.querySelector('textarea');
        const cancelButton = formElement.querySelector('[data-action="cancel"]');

        // Form submission
        formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditSubmit(formElement);
        });

        // Cancel button
        cancelButton.addEventListener('click', () => {
            this.cancelEdit(formElement);
        });

        // Auto-focus and select all text
        setTimeout(() => {
            textarea.focus();
            textarea.select();
        }, 100);

        // Keyboard shortcuts
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cancelEdit(formElement);
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                formElement.dispatchEvent(new Event('submit'));
            }
        });
    },

    /**
     * Handle voting action
     * @param {number} commentId - Comment ID
     * @param {string} action - Vote action (upvote/downvote)
     */
    handleVoting(commentId, action) {
        // Dispatch custom event for vote handling
        document.dispatchEvent(new CustomEvent('commentVote', {
            detail: { commentId, action }
        }));
    },

    /**
     * Handle comment actions (reply, edit, delete)
     * @param {Event} e - Click event
     * @param {Object} comment - Comment data
     * @param {Object} currentUser - Current user data
     */
    handleCommentAction(e, comment, currentUser) {
        const action = e.currentTarget.dataset.action;

        switch (action) {
            case 'reply':
                this.showReplyForm(comment, currentUser);
                break;
            case 'edit':
                this.showEditForm(comment);
                break;
            case 'delete':
                this.showDeleteModal(comment);
                break;
        }
    },

    /**
     * Show reply form
     * @param {Object} comment - Comment being replied to
     * @param {Object} currentUser - Current user data
     */
    showReplyForm(comment, currentUser) {
        const commentElement = document.querySelector(`[data-comment-id="${comment.id}"]`);
        const existingForm = commentElement.querySelector('.comment-form--reply');

        if (existingForm) {
            existingForm.remove();
            return;
        }

        const replyForm = this.createReplyForm(currentUser, comment.user.username, comment.id);
        commentElement.appendChild(replyForm);
        replyForm.classList.add('slide-in');
    },

    /**
     * Show edit form
     * @param {Object} comment - Comment being edited
     */
    showEditForm(comment) {
        const commentElement = document.querySelector(`[data-comment-id="${comment.id}"]`);
        const contentElement = commentElement.querySelector('.comment__content');
        const existingForm = commentElement.querySelector('.edit-form');

        if (existingForm) {
            existingForm.remove();
            contentElement.style.display = 'block';
            return;
        }

        const editForm = this.createEditForm(comment);
        contentElement.style.display = 'none';
        contentElement.parentNode.insertBefore(editForm, contentElement.nextSibling);
        editForm.classList.add('slide-in');
    },

    /**
     * Show delete confirmation modal
     * @param {Object} comment - Comment to delete
     */
    showDeleteModal(comment) {
        document.dispatchEvent(new CustomEvent('showDeleteModal', {
            detail: { commentId: comment.id }
        }));
    },

    /**
     * Handle reply form submission
     * @param {Element} formElement - Reply form element
     */
    handleReplySubmit(formElement) {
        const textarea = formElement.querySelector('textarea');
        const content = textarea.value.trim();
        const parentId = parseInt(formElement.dataset.parentId);
        const replyingTo = formElement.dataset.replyingTo;

        // Extract content after @username
        const atMention = `@${replyingTo} `;
        const actualContent = content.startsWith(atMention)
            ? content.substring(atMention.length).trim()
            : content;

        const validation = Utils.validateComment(actualContent);
        if (!validation.isValid) {
            Utils.showNotification(validation.message, 'error');
            return;
        }

        // Dispatch custom event for reply creation
        document.dispatchEvent(new CustomEvent('createReply', {
            detail: { parentId, replyingTo, content: actualContent }
        }));

        this.cancelReply(formElement);
    },

    /**
     * Handle edit form submission
     * @param {Element} formElement - Edit form element
     */
    handleEditSubmit(formElement) {
        const textarea = formElement.querySelector('textarea');
        const content = textarea.value.trim();
        const commentId = parseInt(formElement.dataset.commentId);

        const validation = Utils.validateComment(content);
        if (!validation.isValid) {
            Utils.showNotification(validation.message, 'error');
            return;
        }

        // Dispatch custom event for comment update
        document.dispatchEvent(new CustomEvent('updateComment', {
            detail: { commentId, content }
        }));

        this.cancelEdit(formElement);
    },

    /**
     * Cancel reply form
     * @param {Element} formElement - Reply form element
     */
    cancelReply(formElement) {
        formElement.classList.add('fade-out');
        setTimeout(() => {
            if (formElement.parentNode) {
                formElement.remove();
            }
        }, 300);
    },

    /**
     * Cancel edit form
     * @param {Element} formElement - Edit form element
     */
    cancelEdit(formElement) {
        const commentElement = formElement.closest('[data-comment-id]');
        const contentElement = commentElement.querySelector('.comment__content');

        formElement.classList.add('fade-out');
        setTimeout(() => {
            if (formElement.parentNode) {
                formElement.remove();
            }
            if (contentElement) {
                contentElement.style.display = 'block';
            }
        }, 300);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Components;
}
