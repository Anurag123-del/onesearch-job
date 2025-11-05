import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });


const companies = [
    // Greenhouse
    { name: 'Stripe', website: 'https://stripe.com', ats_type: 'greenhouse', feed_url: 'https://boards-api.greenhouse.io/v1/boards/stripe/jobs' },
    { name: 'HubSpot', website: 'https://hubspot.com', ats_type: 'greenhouse', feed_url: 'https://boards-api.greenhouse.io/v1/boards/hubspot/jobs' },
    { name: 'Figma', website: 'https://www.figma.com', ats_type: 'greenhouse', feed_url: 'https://boards-api.greenhouse.io/v1/boards/figma/jobs' },
    { name: 'Asana', website: 'https://asana.com', ats_type: 'greenhouse', feed_url: 'https://boards-api.greenhouse.io/v1/boards/asana/jobs' },
    { name: 'GitLab', website: 'https://about.gitlab.com', ats_type: 'greenhouse', feed_url: 'https://boards-api.greenhouse.io/v1/boards/gitlab/jobs' },

    // Lever
    { name: 'Netflix', website: 'https://jobs.netflix.com', ats_type: 'lever', feed_url: 'https://api.lever.co/v0/postings/netflix?mode=json' },
    { name: 'Turo', website: 'https://turo.com', ats_type: 'lever', feed_url: 'https://api.lever.co/v0/postings/turo?mode=json' },
    { name: 'Plaid', website: 'https://plaid.com', ats_type: 'lever', feed_url: 'https://api.lever.co/v0/postings/plaid?mode=json' },
    { name: 'Eventbrite', website: 'https://www.eventbrite.com', ats_type: 'lever', feed_url: 'https://api.lever.co/v0/postings/eventbrite?mode=json' },
    { name: 'Medium', website: 'https://medium.com', ats_type: 'lever', feed_url: 'https://api.lever.co/v0/postings/medium?mode=json' },

    // Ashby
    { name: 'Anthropic', website: 'https://www.anthropic.com', ats_type: 'ashby', feed_url: 'https://jobs.ashbyhq.com/api/non-user-boards/company/anthropic' },
    { name: 'Notion', website: 'https://www.notion.so', ats_type: 'ashby', feed_url: 'https://jobs.ashbyhq.com/api/non-user-boards/company/notion' },
    { name: 'Vercel', website: 'https://vercel.com', ats_type: 'ashby', feed_url: 'https://jobs.ashbyhq.com/api/non-user-boards/company/vercel' },
    { name: 'OpenAI', website: 'https://openai.com', ats_type: 'ashby', feed_url: 'https://jobs.ashbyhq.com/api/non-user-boards/company/openai' },
    { name: 'Ramp', website: 'https://ramp.com', ats_type: 'ashby', feed_url: 'https://jobs.ashbyhq.com/api/non-user-boards/company/ramp' },

];

async function seedCompanies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL or service key not found. Make sure to set them in your .env.local file.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { error } = await supabase.from('companies').upsert(companies, { onConflict: 'name' });

  if (error) {
    console.error('Error seeding companies:', error);
  } else {
    console.log(`Successfully seeded ${companies.length} companies.`);
  }
}

seedCompanies();
