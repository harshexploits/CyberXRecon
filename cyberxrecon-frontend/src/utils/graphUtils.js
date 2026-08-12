import { moduleDetails, moduleOrder } from '../data/moduleData';

export function buildDashboardData(target) {
  const modules = moduleOrder.map((key, i) => ({
    key,
    ...moduleDetails[key],
    color: i % 2 === 0 ? '#22d3ee' : '#a855f7',
  }));
  const totalFindings = modules.reduce((sum, m) => sum + m.items.length, 0);
  return { target, modules, totalFindings };
}

export function buildNetworkGraph(target) {
  const nodes = [{ id: 'root', label: target, group: 1, fx: 0, fy: 0 }];
  const links = [];

  const moduleRadius = 140;
  const findingRadius = 260;
  const angleStep = (Math.PI * 2) / moduleOrder.length;

  moduleOrder.forEach((key, index) => {
    const mod = moduleDetails[key];
    const color = index % 2 === 0 ? '#22d3ee' : '#a855f7';
    const catId = `cat-${key}`;
    const modAngle = index * angleStep;
    const modX = Math.cos(modAngle) * moduleRadius;
    const modY = Math.sin(modAngle) * moduleRadius;

    nodes.push({ id: catId, label: mod.title, icon: mod.icon, group: 2, color, fx: modX, fy: modY });
    links.push({ source: 'root', target: catId });

    const totalLeaves = mod.items.length;
    const increment = totalLeaves > 1 ? Math.min(0.32, (angleStep * 0.7) / (totalLeaves - 1)) : 0;

    mod.items.forEach((item, leafIdx) => {
      const leafId = `${key}-${leafIdx}`;
      const leafSpread = modAngle + (leafIdx - (totalLeaves - 1) / 2) * increment;
      const leafX = Math.cos(leafSpread) * findingRadius;
      const leafY = Math.sin(leafSpread) * findingRadius;
      const shortLabel = item.length > 24 ? item.slice(0, 22) + '…' : item;

      nodes.push({ id: leafId, label: shortLabel, group: 3, color, fx: leafX, fy: leafY });
      links.push({ source: catId, target: leafId });
    });
  });

  return { nodes, links };
}
