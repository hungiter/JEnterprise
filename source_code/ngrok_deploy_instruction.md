
## Install Ngrok for Windows
**Install <u>ngrok</u> via Chocolatey** with the following command:
```sh
choco install ngrok
```
##  Save Ngrok token to your local file
Run the following command to add your authtoken to the default  **ngrok.yml**  [configuration file](https://ngrok.com/docs/agent/config/).
```sh
ngrok config add-authtoken 2xA8jVNwDNatIguFQoduaDn3T2F_2gVutwe58ELAtegEZWRkR
```

## Host By Endpoint
1. **Firstly**, config your web/api service host port
2. **Then**, put your app online at an  [ephemeral domain](https://ngrok.com/docs/network-edge/domains-and-tcp-addresses/#ephemeral-domains)  forwarding to your upstream service.
	```sh
	ngrok http http://localhost:<port>
	```
3. **Lastly**, your endpoints will be listed on the [endpoints page](https://dashboard.ngrok.com/endpoints).
4. **BTW**, don't forget to apply CORS for API Service and config your vite.config.ts for Web service.
	**For Web Service**
	```typescript
	{
		...
		server: {
		    host: true,
		    allowedHosts: [
		      'ngrok link' // Created endpoint
		    ]
		}
	}
	```
	**For API Service**
	```java
	@Configuration
	public class CorsConfig {
	    @Bean
	    public WebMvcConfigurer corsConfigurer() {
	        return new WebMvcConfigurer() {
	            @Override
	            public void addCorsMappings(CorsRegistry registry) {
	                registry.addMapping("/**")
	                        .allowedOrigins("ngrok link")
	                        .allowedMethods("*");
	            }
	        };
	    }
	}
	```

## Host Though Ngrok's Free Domain  
### Note
- Should using web service cuz it's easy on getting Network IP for deploy
### Deploy steps
 1. **Firstly**, create your free domain though **[Domains's page] (https://dashboard.ngrok.com/domains)**
 2. **Then**, config your vite.config.ts to apply
	```typescript
		## vite.config.ts
		{
			...
			server: {
			    host: true,
			    allowedHosts: [
			      'your_free_ngrok_domain' // Ngrok free domain
			    ]
			}
		}
	```
3. **Lastly**,  open **Terminal** and running below code to start tunnel.
	**For Docker**
	```bash
	docker run -it -e Token ngrok/ngrok http Network_IP --url=your_free_ngrok_domain
	```
	**For CMD**
	```bash
	ngrok http --url=your_free_ngrok_domain <host_port>
	```