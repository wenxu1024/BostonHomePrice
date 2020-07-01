from django.contrib import admin

# Register your models here.
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from django.db.models import Count, Avg, Max, Min, Func, DateField, Sum
from django.db.models.functions import Trunc

# Register your models here.
from .models import Home
from .models import HomeSummary


class Round(Func):
    function = 'Round'
    template = '%(function)s(%(expressions)s,2)'


def get_next_in_date_hierarchy(request, date_hierarchy):
    if date_hierarchy + '__day' in request.GET:
        return 'day'
    if date_hierarchy + '__month' in request.GET:
        return 'day'
    if date_hierarchy + '__year' in request.GET:
        return 'month'
    return 'month'


@admin.register(Home)
class HomeAdmin(ImportExportModelAdmin):
    list_display = (
        'zpid',
        'link',
        'taxassess',
        'lastsoldprice',
        'zestimate',
        'street',
        'city',
        'state',
        'zipcode',
        'lastsolddate',
        'yearbuild',
        'area',
        'bathrooms',
        'bedrooms',
        'totalrooms',
    )


@admin.register(HomeSummary)
class HomeSummaryAdmin(ImportExportModelAdmin):
    change_list_template = 'home_summary_change_list.html'
    date_hierarchy = 'lastsolddate'

    list_filter = (
        'city',
    )

    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(
            request,
            extra_context=extra_context,
        )
        try:
            qs = response.context_data['cl'].queryset
        except (AttributeError, KeyError):
            return response
        metrics = {
            'total': Count('id'),
            'average': Round(Avg('lastsoldprice')),
            'maximum': Round(Max('lastsoldprice')),
            'minimum': Round(Min('lastsoldprice')),
        }
        response.context_data['summary'] = list(
            qs
                .values('lastsolddate')
                .annotate(**metrics)
                .order_by('lastsolddate')
        )
        response.context_data['summary_total'] = dict(
            qs
                .aggregate(**metrics)
        )

        period = get_next_in_date_hierarchy(request, self.date_hierarchy)

        summary_over_time = qs.annotate(
            period=Trunc(
                'lastsolddate',
                period,
                output_field=DateField(),
            ),
        ).values('period').annotate(total=Count('id')).order_by('period')

        summary_range = summary_over_time.aggregate(
            low=Min('total'),
            high=Max('total'),
        )
        high = summary_range.get('high', 0)
        low = 0

        response.context_data['summary_over_time'] = [{
            'period': x['period'],
            'total': x['total'] or 0,
            'pct': ((x['total'] or 0) - low) / (high - low) * 100 if high > low else 0
        } for x in summary_over_time]

        soldprice_range = qs.aggregate(
            high=Max('lastsoldprice'),
            low=Min('lastsoldprice'),
        )
        high = soldprice_range.get('high', 0)
        low = soldprice_range.get('low', 0)
        nbins = 20
        binsize = (high - low) / nbins

        summary_lastsoldprice = qs.values('lastsoldprice')
        total_sold = summary_lastsoldprice.count()

        response.context_data['summary_lastsoldprice'] = [{
            'binmiddle': low + 1 / 2 * binsize + i * binsize,
            'count': summary_lastsoldprice.filter(lastsoldprice__gte=low + binsize * i,
                                                  lastsoldprice__lte=low + binsize * (i + 1)).count(),
            'pct': summary_lastsoldprice.filter(lastsoldprice__gte=low + binsize * i,
                                                lastsoldprice__lte=low + binsize * (i + 1)).count(),
        } for i in range(nbins)]

        maxpct = max(x['pct'] for x in response.context_data['summary_lastsoldprice'])
        for entry in response.context_data['summary_lastsoldprice']:
            entry['pct'] = entry['pct'] / maxpct * 100 if maxpct != 0 else 1

        return response