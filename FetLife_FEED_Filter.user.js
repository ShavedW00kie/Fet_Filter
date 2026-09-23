// ==UserScript==
// @name         FetLife FEED Filter (Turbo Patched)
// @namespace    https://github.com/ShavedW00kie/
// @version      1.0
// @author       ShavedW00kie
// @homepageURL  https://github.com/ShavedW00kie
// @description  Standalone FetLife story filter and settings menu, optimized for Hotwire Turbo.
// @match        https://fetlife.com/*
// @match        https://www.fetlife.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @run-at       document-idle
// @license      BSD-3-Clause
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'tbcc_fl_story_enabled_v1';
    const HIDDEN_ATTR = 'data-fl-fsf-hidden';
    const TYPE_ATTR = 'data-fl-fsf-type';
    const PANEL_ID = 'tbcc-fl-story-panel';

    const CATALOG = [
        { category: 'General Profile', items: [{ id: 'friendship_request_accepted', label: 'Accepted a Friendship Request', defaultOn: true }, { id: 'sign_ups', label: 'Sign ups & Invitations', defaultOn: true }, { id: 'following', label: 'Following a Member', defaultOn: true }] },
        { category: 'Profile Updates', items: [{ id: 'profile_updates', label: 'Posted a Profile Update', defaultOn: true }, { id: 'commented_on_profile_update', label: 'Commented on a Profile Update', defaultOn: true }, { id: 'loved_profile_update', label: 'Loved a Profile Update', defaultOn: true }, { id: 'superloved_profile_update', label: 'Superloved a Profile Update', defaultOn: true }, { id: 'fetish_added', label: 'Added/Updated a Fetish', defaultOn: false }] },
        { category: 'Relationship Updates', items: [{ id: 'relationship_changes', label: 'Posted a Relationship Update', defaultOn: true }, { id: 'commented_on_relationship', label: 'Commented on a Relationship Update', defaultOn: true }, { id: 'loved_relationship', label: 'Loved a Relationship Update', defaultOn: true }, { id: 'superloved_relationship_update', label: 'Superloved a Relationship Update', defaultOn: true }] },
        { category: 'Status Updates', items: [{ id: 'status_created', label: 'Posted a Status Update', defaultOn: true }, { id: 'status_comment_created', label: 'Commented on a Status Update', defaultOn: true }, { id: 'loved_status_update', label: 'Loved a Status Update', defaultOn: true }, { id: 'superloved_status_update', label: 'Superloved a Status Update', defaultOn: true }] },
        { category: 'Pictures', items: [{ id: 'picture_created', label: 'Uploaded a New Picture/Album', defaultOn: true }, { id: 'comment_created', label: 'Commented on a Picture/Album', defaultOn: true }, { id: 'loved_picture', label: 'Loved a Picture/Album', defaultOn: true }, { id: 'superloved_picture', label: 'Superloved a Picture/Album', defaultOn: true }, { id: 'user_tagged_in_picture_approved', label: 'Tagged in a Picture', defaultOn: true }, { id: 'tagged_picture_trending_created', label: 'Trending Picture', defaultOn: true }] },
        { category: 'Videos', items: [{ id: 'video_created', label: 'Uploaded a New Video', defaultOn: true }, { id: 'video_comment_created', label: 'Commented on a Video', defaultOn: true }, { id: 'loved_video', label: 'Loved a Video', defaultOn: true }, { id: 'superloved_video', label: 'Superloved a Video', defaultOn: true }, { id: 'user_tagged_in_video_approved', label: 'Tagged in a Video', defaultOn: true }, { id: 'tagged_video_trending_created', label: 'Trending Video', defaultOn: true }] },
        { category: 'Writings', items: [{ id: 'post_created', label: 'Posted a New Writing/Collection', defaultOn: true }, { id: 'post_comment_created', label: 'Commented on a Writing/Collection', defaultOn: true }, { id: 'loved_writing', label: 'Loved a Writing/Collection', defaultOn: true }, { id: 'superloved_writing', label: 'Superloved a Writing/Collection', defaultOn: true }, { id: 'tagged_writing_trending_created', label: 'Trending Writing', defaultOn: true }] },
        { category: 'Wall Posts', items: [{ id: 'wall_posts', label: 'Posted on a Wall', defaultOn: true }, { id: 'commented_on_wall_post', label: 'Commented on a Wall Post', defaultOn: true }, { id: 'loved_wall_post', label: 'Loved a Wall Post', defaultOn: true }, { id: 'superloved_wall_post', label: 'Superloved a Wall Post', defaultOn: true }] },
        { category: 'Community Lists', items: [{ id: 'community_list_created', label: 'Posted a Community List', defaultOn: true }, { id: 'community_list_comment_created', label: 'Commented on a Community List', defaultOn: true }, { id: 'loved_community_list', label: 'Loved a Community List', defaultOn: true }, { id: 'superloved_community_list', label: 'Superloved a Community List', defaultOn: true }] },
        { category: 'Ask Me Anything', items: [{ id: 'ask_me_anything_story_created', label: 'Posted an AMA story', defaultOn: true }, { id: 'ask_me_anything_story_comment_created', label: 'Commented on an AMA story', defaultOn: true }, { id: 'loved_ask_me_anything_story', label: 'Loved an AMA story', defaultOn: true }, { id: 'superloved_ama', label: 'Superloved an AMA story', defaultOn: true }] },
        { category: 'Events', items: [{ id: 'event_created', label: 'Created a New Event', defaultOn: true }, { id: 'rsvp_created', label: 'RSVPed to an Event', defaultOn: true }, { id: 'rsvp_updated', label: 'RSVP updated', defaultOn: true }, { id: 'event_discussion_created', label: 'Posted Event Discussion', defaultOn: true }, { id: 'loved_event_discussion', label: 'Loved Event Discussion', defaultOn: true }, { id: 'superloved_event_discussion', label: 'Superloved an Event Discussion', defaultOn: true }, { id: 'commented_on_event_discussion', label: 'Commented on Event Discussion', defaultOn: true }] },
        { category: 'Groups - General', items: [{ id: 'became_group_leader', label: 'Became Leader of a Group', defaultOn: true }, { id: 'group_membership_created', label: 'Joined a Group', defaultOn: true }] },
        { category: 'Groups - Member Of', items: [{ id: 'group_post_being_member_by_friend', label: 'New Discussion by someone you follow', defaultOn: true }, { id: 'group_post_being_member', label: "New Discussion by someone you don't follow", defaultOn: false }, { id: 'group_comment_created_being_member_by_friend', label: 'Comment on a Discussion by someone you follow', defaultOn: true }, { id: 'loved_group_discussion_being_member', label: 'Loved a Group Discussion', defaultOn: true }, { id: 'superloved_group_discussion_being_member', label: 'Superloved a Group Discussion', defaultOn: true }] },
        { category: 'Groups - Not Member Of', items: [{ id: 'group_post_not_being_member', label: 'New Discussion', defaultOn: false }, { id: 'group_comment_not_being_member', label: 'Comment on a Discussion', defaultOn: false }, { id: 'loved_group_discussion_not_being_member', label: 'Loved a Group Discussion', defaultOn: true }, { id: 'superloved_group_discussion_not_being_member', label: 'Superloved a Group Discussion', defaultOn: true }] }
    ];

    const MATCHERS = [
        { id: 'superloved_picture', re: /superloved .{0,80}(picture|album|pic)\b/i },
        { id: 'loved_picture', re: /\bloved .{0,80}(picture|album|pic)\b/i },
        { id: 'comment_created', re: /commented on .{0,80}(picture|album|pic)\b/i },
        { id: 'user_tagged_in_picture_approved', re: /tagged .{0,40}in .{0,40}(picture|album|pic)\b/i },
        { id: 'tagged_picture_trending_created', re: /trending .{0,40}(picture|album|pic)\b/i },
        { id: 'picture_created', re: /(uploaded|posted|added) .{0,40}(new )?(picture|album|pic)\b/i },
        { id: 'superloved_video', re: /superloved .{0,80}video\b/i },
        { id: 'loved_video', re: /\bloved .{0,80}video\b/i },
        { id: 'video_comment_created', re: /commented on .{0,80}video\b/i },
        { id: 'user_tagged_in_video_approved', re: /tagged .{0,40}in .{0,40}video\b/i },
        { id: 'tagged_video_trending_created', re: /trending .{0,40}video\b/i },
        { id: 'video_created', re: /(uploaded|posted|added) .{0,40}(new )?video\b/i },
        { id: 'superloved_writing', re: /superloved .{0,80}(writing|post|collection)\b/i },
        { id: 'loved_writing', re: /\bloved .{0,80}(writing|collection)\b/i },
        { id: 'post_comment_created', re: /commented on .{0,80}(writing|post|collection)\b/i },
        { id: 'tagged_writing_trending_created', re: /trending .{0,40}(writing|post)\b/i },
        { id: 'post_created', re: /(posted|published|wrote) .{0,40}(new )?(writing|collection)\b/i },
        { id: 'superloved_wall_post', re: /superloved .{0,80}wall\b/i },
        { id: 'loved_wall_post', re: /\bloved .{0,80}wall\b/i },
        { id: 'commented_on_wall_post', re: /commented on .{0,80}wall\b/i },
        { id: 'wall_posts', re: /(posted|wrote) .{0,40}on .{0,40}wall\b/i },
        { id: 'superloved_community_list', re: /superloved .{0,80}(community )?list\b/i },
        { id: 'loved_community_list', re: /\bloved .{0,80}(community )?list\b/i },
        { id: 'community_list_comment_created', re: /commented on .{0,80}(community )?list\b/i },
        { id: 'community_list_created', re: /(posted|created|updated) .{0,40}(community )?list\b/i },
        { id: 'superloved_ama', re: /superloved .{0,80}(ama|ask me anything)\b/i },
        { id: 'loved_ask_me_anything_story', re: /\bloved .{0,80}(ama|ask me anything)\b/i },
        { id: 'ask_me_anything_story_comment_created', re: /commented on .{0,80}(ama|ask me anything)\b/i },
        { id: 'ask_me_anything_story_created', re: /(posted|asked|answered).{0,40}(ama|ask me anything)\b/i },
        { id: 'superloved_event_discussion', re: /superloved .{0,80}event .{0,20}discussion\b/i },
        { id: 'loved_event_discussion', re: /\bloved .{0,80}event .{0,20}discussion\b/i },
        { id: 'commented_on_event_discussion', re: /commented on .{0,80}event .{0,20}discussion\b/i },
        { id: 'event_discussion_created', re: /(posted|started).{0,40}event .{0,20}discussion\b/i },
        { id: 'rsvp_updated', re: /rsvp(ed)? .{0,40}updated|updated .{0,40}rsvp/i },
        { id: 'rsvp_created', re: /rsvp(ed)? (to|for) .{0,60}event\b|is (going|interested)/i },
        { id: 'event_created', re: /(created|posted) .{0,40}(new )?event\b/i },
        { id: 'superloved_group_discussion_being_member', re: /superloved .{0,80}(group )?discussion\b/i },
        { id: 'loved_group_discussion_being_member', re: /\bloved .{0,80}(group )?discussion\b/i },
        { id: 'group_comment_created_being_member_by_friend', re: /commented on .{0,80}(group )?discussion\b/i },
        { id: 'group_post_being_member_by_friend', re: /(posted|started|created) .{0,40}(new )?(group )?discussion\b/i },
        { id: 'became_group_leader', re: /became .{0,40}(leader|owner).{0,40}group\b/i },
        { id: 'group_membership_created', re: /(joined|became a member of) .{0,60}group\b/i },
        { id: 'superloved_status_update', re: /superloved .{0,80}status\b/i },
        { id: 'loved_status_update', re: /\bloved .{0,80}status\b/i },
        { id: 'status_comment_created', re: /commented on .{0,80}status\b/i },
        { id: 'status_created', re: /(posted|updated) .{0,40}status\b/i },
        { id: 'superloved_relationship_update', re: /superloved .{0,80}relationship\b/i },
        { id: 'loved_relationship', re: /\bloved .{0,80}relationship\b/i },
        { id: 'commented_on_relationship', re: /commented on .{0,80}relationship\b/i },
        { id: 'following', re: /(is now following|started following|followed)\b/i },
        { id: 'relationship_changes', re: /\b(relationship|partner|in a relationship)\b/i },
        { id: 'superloved_profile_update', re: /superloved .{0,80}profile\b/i },
        { id: 'loved_profile_update', re: /\bloved .{0,80}profile\b/i },
        { id: 'commented_on_profile_update', re: /commented on .{0,80}profile\b/i },
        { id: 'fetish_added', re: /(added|updated).{0,40}fetish/i },
        { id: 'profile_updates', re: /(updated|changed).{0,40}profile\b/i },
        { id: 'friendship_request_accepted', re: /(accepted|are now friends|friendship)/i },
        { id: 'sign_ups', re: /(signed up|joined fetlife|invited)/i },
    ];

    function defaultEnabledMap() {
        const map = {};
        for (const cat of CATALOG) {
            for (const item of cat.items) map[item.id] = item.defaultOn;
        }
        return map;
    }

    function classifyStoryText(text) {
        const t = String(text || '').replace(/\s+/g, ' ').trim();
        if (!t) return null;
        for (const m of MATCHERS) {
            if (m.re.test(t)) return m.id;
        }
        return null;
    }

    let enabled = (() => {
        const base = defaultEnabledMap();
        try {
            const saved = GM_getValue(STORAGE_KEY);
            return saved && typeof saved === 'object' ? { ...base, ...saved } : base;
        } catch (e) {
            return base;
        }
    })();

    let stylesInjected = false;
    function ensureStyles() {
        if (stylesInjected) return;
        GM_addStyle(`
            [${HIDDEN_ATTR}="1"] { display: none !important; }
            #${PANEL_ID} {
                position: fixed; z-index: 1000000; right: 16px; bottom: 110px;
                width: min(420px, calc(100vw - 24px)); max-height: min(65vh, 560px);
                overflow: auto; background: #1a1a1a; color: #d4d4d4;
                border: 1px solid #333; border-radius: 8px; display: none;
                font: 13px/1.35 system-ui, sans-serif;
            }
            #${PANEL_ID}.open { display: block; }
            #${PANEL_ID} header {
                position: sticky; top: 0; background: #222; padding: 10px 12px;
                display: flex; gap: 8px; align-items: center; border-bottom: 1px solid #333;
            }
            #${PANEL_ID} header strong { flex: 1; }
            #${PANEL_ID} button {
                background: #333; color: #eee; border: 1px solid #555; border-radius: 6px;
                padding: 6px 10px; cursor: pointer;
            }
            #${PANEL_ID} .cat { padding: 8px 12px 4px; font-weight: 700; color: #bbb; }
            #${PANEL_ID} label { display: flex; gap: 8px; padding: 4px 12px 4px 16px; cursor: pointer; }
            #tbcc-fl-story-fab {
                position: fixed; z-index: 1000000; right: 16px; bottom: 60px;
                background: #333; color: #eee; border: 1px solid #555;
                border-radius: 6px; padding: 6px 10px; cursor: pointer; font: 13px system-ui, sans-serif;
            }
        `);
        stylesInjected = true;
    }

    function applyFeedFilter() {
        const selectors = ['#stories-list > *', '#fl-masonry-wrap .fl-masonry-col > *', '#stories > *'];
        const nodes = new Set();
        
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (el.classList?.contains('infinite-loading-container') || el.closest(`#${PANEL_ID}`)) return;
                nodes.add(el);
            });
        });

        Array.from(nodes).filter(el => !Array.from(nodes).some(o => o !== el && o.contains(el))).forEach(el => {
            const text = el.innerText || el.textContent || '';
            const type = el.getAttribute('data-feed-event') ||
                         el.getAttribute('data-story-type') ||
                         el.getAttribute('data-type') ||
                         classifyStoryText(text);

            if (type) el.setAttribute(TYPE_ATTR, type);
            
            if (!type || enabled[type] !== false) {
                el.removeAttribute(HIDDEN_ATTR);
            } else {
                el.setAttribute(HIDDEN_ATTR, '1');
            }
        });
    }

    function buildTypePanel() {
        if (document.getElementById(PANEL_ID)) return;
        
        const panel = document.createElement('div');
        panel.id = PANEL_ID;
        panel.innerHTML = `
            <header>
                <strong>Story Filter</strong>
                <button type="button" data-act="all-on">All on</button>
                <button type="button" data-act="all-off">All off</button>
                <button type="button" data-act="close">Close</button>
            </header>
            <div style="padding:8px 12px;color:#888;font-size:12px">Unchecked = hidden in browser only.</div>
        `;

        CATALOG.forEach(cat => {
            const h = document.createElement('div');
            h.className = 'cat';
            h.textContent = cat.category;
            panel.appendChild(h);

            cat.items.forEach(item => {
                const lab = document.createElement('label');
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = enabled[item.id] !== false;
                
                cb.addEventListener('change', () => {
                    enabled = { ...enabled, [item.id]: cb.checked };
                    GM_setValue(STORAGE_KEY, enabled);
                    applyFeedFilter();
                });

                lab.appendChild(cb);
                lab.appendChild(document.createTextNode(item.label));
                panel.appendChild(lab);
            });
        });

        panel.querySelector('[data-act="close"]').onclick = () => panel.classList.remove('open');
        panel.querySelector('[data-act="all-on"]').onclick = () => {
            Object.keys(enabled).forEach(k => enabled[k] = true);
            GM_setValue(STORAGE_KEY, enabled);
            panel.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = true);
            applyFeedFilter();
        };
        panel.querySelector('[data-act="all-off"]').onclick = () => {
            Object.keys(enabled).forEach(k => enabled[k] = false);
            GM_setValue(STORAGE_KEY, enabled);
            panel.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);
            applyFeedFilter();
        };

        const target = document.body;
        target.appendChild(panel);

        if (!document.getElementById('tbcc-fl-story-fab')) {
            const fab = document.createElement('button');
            fab.id = 'tbcc-fl-story-fab';
            fab.type = 'button';
            fab.textContent = 'Story Filter';
            fab.onclick = () => panel.classList.toggle('open');
            target.appendChild(fab);
        }
    }

    function ensureDom() {
        ensureStyles();
        buildTypePanel();
        applyFeedFilter();
    }

    // Native Turbo Lifecycle Hooks
    document.addEventListener("turbo:load", ensureDom);
    document.addEventListener("turbo:render", ensureDom);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureDom);
    } else {
        ensureDom();
    }

    // Lightweight observer to catch infinitely scrolling cards
    const observer = new MutationObserver((mutations) => {
        let shouldApply = false;
        for (let m of mutations) {
            if (m.addedNodes.length > 0) shouldApply = true;
        }
        if (shouldApply) applyFeedFilter();
    });

    const startObserver = () => {
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            setTimeout(startObserver, 100);
        }
    };
    startObserver();

})();
