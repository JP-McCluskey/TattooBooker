# 🎨 Tattoo Booker

A modern web application that connects tattoo artists with clients, making it easy to discover, book, and manage tattoo appointments.

![Tattoo Booker Screenshot](https://placehold.co/600x400?text=Tattoo+Booker+Screenshot)

## ✨ Features

### For Clients
- 🔍 Search and explore tattoo artists and studios
- 💫 Browse tattoo galleries with advanced filtering
- ❤️ Like and bookmark favorite tattoo designs
- 📅 Book appointments with preferred artists
- 👤 Personal profile management
- 🌙 Dark/Light mode support
- 🌐 Multi-language support (English/French)

### For Artists/Studios
- 🎨 Portfolio management
- 📊 Business profile customization
- 📅 Appointment management
- 📈 Analytics and insights
- 🏷️ Custom tags and categories

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Netlify

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tattoo-booker.git
   cd tattoo-booker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
     ```env
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. Run database migrations:
   ```bash
   npx supabase migration up
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Live Demo

Visit the live application at [https://tattoobooker.netlify.app](https://tattoobooker.netlify.app)

## 📱 Screenshots

### Home Page
![Home Page](https://placehold.co/600x400?text=Home+Page)

### Explore Page
![Explore Page](https://placehold.co/600x400?text=Explore+Page)

### Artist Profile
![Artist Profile](https://placehold.co/600x400?text=Artist+Profile)

## 🔑 Key Features in Detail

### Search and Discovery
- Advanced filtering by style, location, and price range
- Real-time search suggestions
- Geolocation-based studio finder

### User Profiles
- Secure authentication
- Profile customization
- Booking history
- Favorite artists and designs

### Business Management
- Studio profile management
- Artist portfolio showcase
- Appointment scheduling
- Business analytics

### Image Management
- High-quality image uploads
- Gallery organization
- Style tagging
- Portfolio showcase

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [Lucide Icons](https://lucide.dev) for the icon set
- All contributors who have helped shape this project

## 📞 Support

For support, email thetattoobooker@gmail.com 

## 🔮 Roadmap

- [ ] Mobile app development
- [ ] Real-time chat between artists and clients
- [ ] Online payment integration
- [ ] Review and rating system
- [ ] Artist verification system
- [ ] Integration with popular calendar apps

## 💻 Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Git

### Code Style
We use ESLint and Prettier for code formatting. Please ensure your code follows our style guide by running:
```bash
npm run lint
npm run format
```

### Testing
Run the test suite:
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

## 🌟 Star Us!
If you find this project helpful, please consider giving it a star ⭐️ to show your support!