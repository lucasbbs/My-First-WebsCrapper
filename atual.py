
import dryscrape
import requests
from bs4 import BeautifulSoup
session = dryscrape.Session()
my_url = 'https://data.anbima.com.br/debentures/AGRU12/agenda'
session.visit(my_url)
res = requests.get(my_url)
res.encoding = 'utf-8'
soup = BeautifulSoup(res.text, 'html.parser')
print(soup.prettify())
