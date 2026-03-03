import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const isTrial = request.cookies.get('trial_session')?.value === 'true';
  let user = null;
  let profile = null;

  if (isTrial) {
    // Fake the user for trial mode to pass checks
    user = { 
        id: 'trial-id-000', 
        email: process.env.NEXT_PUBLIC_TRIAL_ADMIN_EMAIL,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '',
        role: 'authenticated'
    } as any;
    
    profile = { 
        role: 'admin', 
        full_name: 'Trial Master Admin', 
        username: 'trial_admin',
        avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyrRnmar-je_OLpz_YnW4YsUyEjxLLzEKr5G_wEKsMZLBqxTdGY3mCT315-wtapbd9Ia88qwnDH9-Dtk9Ga6JB9D0YU6SXqLXYUkBsKGmy21uZJwTdF2JuFI2jyfWY0IJF0NM2gJElFFqfdXfBKq2Cr74e2l-p2Or4OpsWUkf9710LL46LwqntWg86KD-6t6S2r8HuJ-MOrNFOq7BQ4Bu8zO3L-aImdNQuNKqhrTSLO3pzufzF9dJoP_X6tms6fGYdphb7H2ZWc5k'
    };
  } else {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role, full_name, username')
          .eq('id', user.id)
          .single();
        profile = data;
      }
    } catch (e) {
      console.error('Supabase auth/profile error:', e);
    }
  }

  // Set profile info in headers to "pass" it to server components
  if (profile) {
    request.headers.set('x-user-role', profile.role || 'user');
    request.headers.set('x-user-name', profile.full_name || '');
    request.headers.set('x-user-username', profile.username || '');
  }

  // Protected routes check
  const isProtectedPath = request.nextUrl.pathname.startsWith('/profile') ||
                          request.nextUrl.pathname.startsWith('/folders') ||
                          request.nextUrl.pathname.startsWith('/packages') ||
                          request.nextUrl.pathname.startsWith('/api/upload') ||
                          request.nextUrl.pathname.startsWith('/admin'); // New admin route

  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isAuthPath = request.nextUrl.pathname.startsWith('/login') ||
                    request.nextUrl.pathname.startsWith('/register');

  // Handle API unauthorized
  if (isProtectedPath && !user && request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Handle Page unauthorized
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Special Admin Check
  if (isAdminPath && profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  // Create response with updated headers
  const finalResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  return finalResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (unless it's /api/upload)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
