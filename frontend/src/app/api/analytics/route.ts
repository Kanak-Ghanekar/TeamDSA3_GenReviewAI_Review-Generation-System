import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function parseCSV(filePath: string): any[] {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) return [];
    
    // Parse header
    const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, ''));
    
    const results = [];
    for (let i = 1; i < lines.length; i++) {
      // Basic comma split (handling simple values)
      const values = lines[i].split(',').map(v => v.replace(/^["']|["']$/g, ''));
      const obj: any = {};
      headers.forEach((header, idx) => {
        let val: any = values[idx] || '';
        // Convert to number if numeric
        if (!isNaN(val as any) && val.trim() !== '') {
          val = Number(val);
        }
        obj[header] = val;
      });
      results.push(obj);
    }
    return results;
  } catch (error) {
    console.error(`Error parsing CSV at ${filePath}:`, error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantName = searchParams.get('restaurantName');

    // Path to the ML generated dashboard directory
    const mlDir = path.resolve('..', '..', 'Review-Folder All file', 'Review', 'dashboard');
    
    const healthScores = parseCSV(path.join(mlDir, 'restaurant_health_scores.csv'));
    const aspectScores = parseCSV(path.join(mlDir, 'restaurant_aspect_scores.csv'));
    const complaintAnalysis = parseCSV(path.join(mlDir, 'complaint_analysis.csv'));
    const recommendations = parseCSV(path.join(mlDir, 'improvement_recommendations.csv'));
    const monthlyTrends = parseCSV(path.join(mlDir, 'monthly_trends.csv'));

    if (restaurantName) {
      const nameLower = restaurantName.toLowerCase();
      const filterFunc = (item: any) => item['Restaurant Name'] && item['Restaurant Name'].toLowerCase().includes(nameLower);

      return NextResponse.json({
        success: true,
        data: {
          healthScore: healthScores.find(filterFunc) || null,
          aspectScores: aspectScores.find(filterFunc) || null,
          complaints: complaintAnalysis.find(filterFunc) || null,
          recommendation: recommendations.find(filterFunc) || null,
          monthlyTrends: monthlyTrends.filter(filterFunc)
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        healthScores,
        aspectScores,
        complaintAnalysis,
        recommendations,
        monthlyTrends
      }
    });

  } catch (error: any) {
    console.error('API /api/analytics error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch analytics.' },
      { status: 500 }
    );
  }
}
