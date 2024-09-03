def reverse_proxy(get_response):
    def process_request(request):
        x_forwarded_for = request.headers.get('X-Forwarded-For')
        if x_forwarded_for:
            # The first IP in the list is the original client's IP
            ip = x_forwarded_for.split(',')[0]
        else:
            # Fallback to the REMOTE_ADDR if the header is not found
            ip = request.META.get('REMOTE_ADDR')

        # Set the REMOTE_ADDR to the client's IP
        request.META['REMOTE_ADDR'] = ip
        return get_response(request)
    return process_request
