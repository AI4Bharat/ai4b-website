from django.contrib import admin

from .models import Member

# Register your models here.


class MemberAdmin(admin.ModelAdmin):
    list_filter = ["team", "language"]
    search_fields = (
        "first_name",
        "last_name",
    )


admin.site.register(Member, MemberAdmin)
