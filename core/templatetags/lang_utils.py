from django import template
from django.utils.translation import get_language

register = template.Library()


@register.simple_tag(takes_context=True)
def path_without_lang_prefix(context):
    """
    Returns the current request path (with query string) stripped of any
    Django i18n language prefix (e.g. /hi/hospitals/?city=X → /hospitals/?city=X).
    Used in the language switcher so that `next` always points to the
    language-neutral URL, letting Django redirect correctly after switching.
    """
    request = context.get('request')
    if not request:
        return '/'

    # Full path including query string, e.g. /hi/hospitals/?city=Mumbai
    path = request.get_full_path()

    lang = get_language()           # e.g. 'hi', 'mr', 'en'
    if lang and lang != 'en':       # English has no prefix (prefix_default_language=False)
        prefix = f'/{lang}'
        if path == prefix or path.startswith(prefix + '/') or path.startswith(prefix + '?'):
            path = path[len(prefix):] or '/'

    return path
