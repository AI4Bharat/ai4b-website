import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

# Function to extract SEO-related meta tags
def extract_seo_tags(url):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract Title
            title = soup.title.string if soup.title else 'No title tag'
            
            # Extract Meta Description
            meta_description = soup.find('meta', attrs={'name': 'description'})
            meta_description_content = meta_description['content'] if meta_description else 'No meta description'
            
            # Extract Meta Keywords
            meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
            meta_keywords_content = meta_keywords['content'] if meta_keywords else 'No meta keywords'
            
            # Extract other meta tags (add more as needed)
            meta_robots = soup.find('meta', attrs={'name': 'robots'})
            meta_robots_content = meta_robots['content'] if meta_robots else 'No meta robots tag'

            # Print SEO information for the URL
            print(f"URL: {url}")
            print(f"Title: {title}")
            print(f"Description: {meta_description_content}")
            print(f"Keywords: {meta_keywords_content}")
            print(f"Robots: {meta_robots_content}")
            print("-" * 80)

        else:
            print(f"Failed to fetch {url} (Status Code: {response.status_code})")
    
    except Exception as e:
        print(f"Error fetching {url}: {e}")

# Function to crawl all links from the base URL
def crawl_site(base_url):
    try:
        response = requests.get(base_url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            visited_urls = set()
            visited_urls.add(base_url)
            
            # Crawl for all anchor links in the page
            for a_tag in soup.find_all('a', href=True):
                link = urljoin(base_url, a_tag['href'])
                if base_url in link and link not in visited_urls:
                    visited_urls.add(link)
                    extract_seo_tags(link)
                    
            # Crawling the base page
            extract_seo_tags(base_url)

        else:
            print(f"Failed to crawl {base_url} (Status Code: {response.status_code})")

    except Exception as e:
        print(f"Error crawling {base_url}: {e}")

# Set the base URL for your localhost website
base_url = "http://localhost:3000"  # Change the port as per your server config

# Start the audit
crawl_site(base_url)