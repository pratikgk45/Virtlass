from django.views.generic import TemplateView

class HomePage(TemplateView):
	template_name = 'classroom/index.html'

class ServicesPage(TemplateView):
	template_name = 'classroom/services.html'