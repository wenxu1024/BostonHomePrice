from import_export import resources
from .models import Home


class HomeResource(resources.ModelResource):
    class Meta:
        model = Home
