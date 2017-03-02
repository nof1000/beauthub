(function(window, chrome, runtime){
    'use strict';

    /**
     * Constants
     * @private
     */
    var RE_TEMPLATE_VAR = /\{\{(.*?)\}\}/g;

    /**
     * Methods
     * @private
     */
    function getTemplate(name) {
        return document.getElementById('template-' + name).innerHTML;
    }

    function render(tmpl, params) {
        return tmpl.replace(RE_TEMPLATE_VAR, function(match, value) {
            console.log(match);
            if (params[value] !== undefined) return params[value];
            return match;
        });
    }

    /**
     * Implementation
     * @private
     */
    var TMPL_PREVIEW = getTemplate('preview');
    var TMPL_PALETTE = getTemplate('palette');

    var elemList = document.querySelector('.list');
    var elemPreviews = null;

    runtime.sendMessage(null, { type: 'init_popup' }, function(data) {
        var finalHTML = '';

        data.list.forEach(function(theme, index) {
            var paletteHTML = '';

            theme.palette.forEach(function(color) {
                paletteHTML += render(TMPL_PALETTE, {
                    color: color,
                });
            });

            finalHTML += render(TMPL_PREVIEW, {
                id: index,
                name: theme.name,
                image: theme.image,
                palette: paletteHTML,
            });
        });

        elemList.innerHTML = finalHTML;

        /** Get all previews */
        elemPreviews = document.querySelectorAll('.preview_image');
        elemPreviews.forEach(function(elem, index) {
            if (data.chosen == index) {
                elem.setAttribute('class', 'preview_image preview_image--chosen');
            }

            elem.addEventListener('click', function() {
                var id = index;

                elemPreviews.forEach(function(preview, index) {
                    console.log(preview);
                    if (index != id) return preview.setAttribute('class', 'preview_image');
                    preview.setAttribute('class', 'preview_image preview_image--chosen');
                });

                runtime.sendMessage(null, {
                    type: 'update_theme',
                    theme: id,
                });
            });
        });
    });
})(
    this,
    this.chrome,
    this.chrome.runtime
);
