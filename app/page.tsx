"use client";
import { useEffect, useState } from "react";

type Stats = {
  total_leads: number;
  total_sent: number;
  sent_today: number;
  sent_week: number;
  total_replied: number;
  total_booked: number;
};

type Lead = {
  id: number;
  company: string;
  contact_name: string;
  email: string;
  niche: string;
  emails_sent: number;
  sequence: number;
  last_contacted: string | null;
  deal_status: string;
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-gray-100 text-gray-600",
  contacted: "bg-blue-100 text-blue-700",
  replied: "bg-yellow-100 text-yellow-700",
  booked: "bg-green-100 text-green-700",
  closed: "bg-purple-100 text-purple-700",
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [s, l] = await Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/leads").then((r) => r.json()),
    ]);
    setStats(s);
    setLeads(l);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = leads.filter(
    (l) =>
      l.company?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  const replyRate =
    stats && Number(stats.total_sent) > 0
      ? ((Number(stats.total_replied) / Number(stats.total_sent)) * 100).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nexyn AI — Deal Closer</h1>
          <p className="text-sm text-gray-500">Email outreach pipeline</p>
        </div>
        <button
          onClick={fetchData}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-700 cursor-pointer"
        >
          Refresh
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Leads", value: stats?.total_leads, color: "text-gray-900" },
            { label: "Sent Today", value: stats?.sent_today, color: "text-blue-600" },
            { label: "Sent This Week", value: stats?.sent_week, color: "text-blue-500" },
            { label: "Total Sent", value: stats?.total_sent, color: "text-gray-700" },
            { label: "Replied", value: stats?.total_replied, color: "text-yellow-600" },
            { label: "Reply Rate", value: `${replyRate}%`, color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>
                {loading ? "—" : s.value ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pipeline */}
        <div className="grid grid-cols-4 gap-4">
          {["new", "contacted", "replied", "booked"].map((status) => {
            const count = leads.filter((l) => l.deal_status === status).length;
            return (
              <div key={status} className="bg-white rounded-xl border p-4">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
                  {status.toUpperCase()}
                </span>
                <p className="text-3xl font-bold text-gray-900 mt-3">{count}</p>
                <p className="text-xs text-gray-400">leads</p>
              </div>
            );
          })}
        </div>

        {/* Leads table */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">All Leads</h2>
            <input
              type="text"
              placeholder="Search company, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm border rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Company</th>
                  <th className="px-5 py-3 text-left">Contact</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Niche</th>
                  <th className="px-5 py-3 text-center">Sent</th>
                  <th className="px-5 py-3 text-center">Sequence</th>
                  <th className="px-5 py-3 text-left">Last Contacted</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900 max-w-[160px] truncate">
                      {lead.company || "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{lead.contact_name || "—"}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{lead.email}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{lead.niche || "—"}</td>
                    <td className="px-5 py-3 text-center text-gray-700">{lead.emails_sent || 0}</td>
                    <td className="px-5 py-3 text-center text-gray-500">{lead.sequence || 0}/3</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {lead.last_contacted
                        ? new Date(lead.last_contacted).toLocaleDateString()
                        : "Not yet"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.deal_status] || STATUS_COLORS.new}`}>
                        {lead.deal_status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-gray-400">
                      No leads yet. Run the Python script to start finding leads.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commands reference */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Run Commands (in your terminal)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Find Leads", cmd: 'python main.py find "marketing agency USA" --count 20' },
              { label: "Send Emails", cmd: "python main.py send" },
              { label: "Send Follow-ups", cmd: "python main.py followup" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">{item.label}</p>
                <code className="text-xs text-gray-700 break-all">{item.cmd}</code>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Run from <code>C:\Users\Husnain\deal-closer</code>. Dashboard auto-refreshes every 30 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
