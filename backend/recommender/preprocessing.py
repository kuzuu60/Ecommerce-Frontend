import re

import pandas as pd


CATEGORY_GROUPS = {
    'laptops': 'electronics',
    'smartphones': 'electronics',
    'tablets': 'electronics',
    'mobile-accessories': 'electronics',
    'home-decoration': 'home-living',
    'furniture': 'home-living',
    'kitchen-accessories': 'home-living',
    'sports-accessories': 'sports',
    'sunglasses': 'sports',
}


def clean_text(value):
    if value is None:
        return ''
    if isinstance(value, (list, tuple, set)):
        value = ' '.join(str(item) for item in value)
    return re.sub(r'\s+', ' ', str(value).lower()).strip()


def category_group(category):
    normalized = clean_text(category).replace(' ', '-')
    return CATEGORY_GROUPS.get(normalized, 'other')


def _value(product, *names):
    for name in names:
        if name in product and product[name] is not None:
            return product[name]
    return ''


def prepare_products(products):
    frame = pd.DataFrame(products).copy()
    if frame.empty:
        return frame

    frame['id'] = pd.to_numeric(frame.get('id'), errors='coerce').astype('Int64')
    frame['title_display'] = frame.apply(lambda row: str(_value(row, 'title', 'name') or ''), axis=1)
    frame['category_display'] = frame.apply(lambda row: str(_value(row, 'category', 'subCategory') or ''), axis=1)
    frame['brand_display'] = frame.apply(lambda row: str(_value(row, 'brand') or ''), axis=1)
    frame['title'] = frame['title_display'].map(clean_text)
    frame['category'] = frame['category_display'].map(clean_text)
    frame['brand'] = frame['brand_display'].map(clean_text)
    frame['description'] = frame.apply(lambda row: clean_text(_value(row, 'description')), axis=1)
    frame['specs'] = frame.apply(lambda row: clean_text(_value(row, 'specs', 'specifications')), axis=1)
    frame['tags'] = frame.apply(lambda row: clean_text(_value(row, 'tags', 'keywords')), axis=1)
    frame['price_numeric'] = pd.to_numeric(frame.get('price'), errors='coerce')
    frame['price_numeric'] = frame['price_numeric'].fillna(frame['price_numeric'].median()).fillna(0)
    frame['discount_numeric'] = pd.to_numeric(
        frame.apply(lambda row: _value(row, 'discountPercentage', 'discount_percentage'), axis=1),
        errors='coerce',
    ).fillna(0).clip(lower=0, upper=100)
    frame['sale_price_numeric'] = (frame['price_numeric'] * (1 - frame['discount_numeric'] / 100)).round(2)
    frame['stock_numeric'] = pd.to_numeric(frame.get('stock'), errors='coerce').fillna(0)
    frame['category_group'] = frame['category'].map(category_group)
    frame['feature_text'] = frame.apply(
        lambda row: ' '.join(filter(None, [
            # Department prefix for broad grouping
            f'department-{row.category_group}',
            # Category repeated twice – important discriminator
            row.category, row.category,
            # Title repeated three times – strongest identity signal
            row.title, row.title, row.title,
            # Brand
            row.brand,
            # Specs repeated twice – second strongest for similarity
            row.specs, row.specs,
            # Description once – provides context but is more verbose
            row.description,
            # Tags once
            row.tags,
        ])),
        axis=1,
    )
    return frame.reset_index(drop=True)
