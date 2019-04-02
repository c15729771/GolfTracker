# Generated by Django 2.1.7 on 2019-03-31 21:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('GolfTracker', '0005_auto_20190326_2319'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hole',
            name='hole_number',
            field=models.CharField(choices=[('1', 'Hole 1'), ('2', 'Hole 2'), ('3', 'Hole 3'), ('4', 'Hole 4'), ('5', 'Hole 5'), ('6', 'Hole 6'), ('7', 'Hole 7'), ('8', 'Hole 8'), ('9', 'Hole 9'), ('10', 'Hole 10'), ('11', 'Hole 11'), ('12', 'Hole 12'), ('13', 'Hole 13'), ('14', 'Hole 14'), ('15', 'Hole 15'), ('16', 'Hole 16'), ('17', 'Hole 17'), ('18', 'Hole 18')], max_length=2),
        ),
    ]