import React from 'react'
import { Facebook } from 'lucide-react'
import { Twitter } from 'lucide-react'
import { Instagram } from 'lucide-react'
import { Linkedin } from 'lucide-react'
import { Youtube } from 'lucide-react'

const Footer = () => {
  const socialLinks = [
    { name: 'Facebook', url: '#', icon: <Facebook /> },
    { name: 'Twitter', url: '#', icon: <Twitter /> },
    { name: 'Instagram', url: '#', icon: <Instagram /> },
    { name: 'LinkedIn', url: '#', icon: <Linkedin /> },
    { name: 'YouTube', url: '#', icon: <Youtube /> }
  ]

  const pages = [
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
    { name: 'Events', url: '/events' },
    { name: 'Team', url: '/about#team' },
  ]

  return (
    <footer className=" border-t border-border py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Column 1: DRESTEIN 2025 */}
          <div className="space-y-4">
            <h2 className="font-audiowide text-2xl md:text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DRESTEIN
            </h2>
            <p className="text-muted-text font-space text-lg">
              2025
            </p>
            <p className="text-muted-text font-space text-sm leading-relaxed">
              Innovating the future with cutting-edge technology and creative solutions.
            </p>
          </div>

          {/* Column 2: Social Links */}
          <div className="space-y-4">
            <h3 className="font-audiowide text-lg text-white">
              FOLLOW US
            </h3>
            <div className="space-y-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="flex items-center gap-3 text-muted-text hover:text-primary transition-colors duration-300 font-space"
                >
                  <span className="text-lg">{social.icon}</span>
                  <span>{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Pages */}
          <div className="space-y-4">
            <h3 className="font-audiowide text-lg text-white">
              PAGES
            </h3>
            <div className="space-y-3">
              {pages.map((page, index) => (
                <a
                  key={index}
                  href={page.url}
                  className="block text-muted-text hover:text-accent transition-colors duration-300 font-space"
                >
                  {page.name}
                </a>
              ))}
            </div>
          </div>

          {/* Column 4: Location */}
          <div className="space-y-4">
            <h3 className="font-audiowide text-lg text-white">
              LOCATION
            </h3>
            <div className="space-y-3 text-muted-text font-space">
              <div className="flex items-start gap-2">
                <span className="text-primary mt-1">📍</span>
                <div>
                  <p>Saveetha Nagar,</p>
                  <p>Sriperumbadur Taluk, Kanchipuram District</p>
                  <p>Chennai - 602105</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">📞</span>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✉️</span>
                <span>hello@drestein.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-text font-space text-sm">
              © 2025 DRESTEIN. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm font-space">
              <a href="#" className="text-muted-text hover:text-primary transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-text hover:text-primary transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-muted-text hover:text-primary transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
