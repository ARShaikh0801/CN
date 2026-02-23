from django import template

register = template.Library()

@register.filter(name='split')
def split(value, arg):
    """Split a string by the given separator"""
    return value.split(arg)

# Official website URLs for known government / insurance schemes
SCHEME_URLS = {
    'ayushman bharat pm-jay': 'https://pmjay.gov.in',
    'pmjay': 'https://pmjay.gov.in',
    'pm-jay': 'https://pmjay.gov.in',
    'mukhyamantri amrutum yojana': 'https://magujarat.com',
    'ma yojana': 'https://magujarat.com',
    'cghs': 'https://cghs.gov.in',
    'central government health scheme': 'https://cghs.gov.in',
    'esic': 'https://esic.gov.in',
    'employees state insurance': 'https://esic.gov.in',
    'esi': 'https://esic.gov.in',
    'rashtriya swasthya bima yojana': 'https://rsby.gov.in',
    'rsby': 'https://rsby.gov.in',
    'pradhan mantri jan arogya yojana': 'https://pmjay.gov.in',
}

@register.filter(name='scheme_url')
def scheme_url(scheme_name):
    """Return the official website URL for a known government/insurance scheme, or empty string."""
    if not scheme_name:
        return ''
    return SCHEME_URLS.get(scheme_name.strip().lower(), '')
