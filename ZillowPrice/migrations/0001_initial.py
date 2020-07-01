# Generated by Django 3.0.7 on 2020-06-26 15:14

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Home',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('zpid', models.CharField(max_length=20)),
                ('link', models.CharField(max_length=100)),
                ('taxassess', models.FloatField(null=True)),
                ('lastsoldprice', models.FloatField(null=True)),
                ('zestimate', models.FloatField(null=True)),
                ('street', models.CharField(max_length=100)),
                ('city', models.CharField(max_length=20)),
                ('state', models.CharField(max_length=10)),
                ('zipcode', models.CharField(max_length=10)),
                ('lastsolddate', models.DateField()),
                ('yearbuild', models.FloatField(null=True)),
                ('area', models.FloatField(null=True)),
                ('bathrooms', models.FloatField(null=True)),
                ('bedrooms', models.FloatField(null=True)),
                ('totalrooms', models.FloatField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='HomeSummary',
            fields=[
            ],
            options={
                'verbose_name': 'Home Summary',
                'verbose_name_plural': 'Homes Summary',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('ZillowPrice.home',),
        ),
    ]